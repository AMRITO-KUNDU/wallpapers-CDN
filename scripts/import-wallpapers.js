#!/usr/bin/env node
// Import phone-friendly images from Wikimedia Commons.
//
// Only images with machine-readable redistribution-friendly licenses are
// accepted. Every imported file gets a sidecar with its author, source page,
// license, and the conversion performed here. Search results are filtered to
// portrait images with adequate resolution before any download occurs.
//
// Usage:
//   node scripts/import-wallpapers.js
//   IMPORT_LIMIT=10 IMPORT_QUERIES="mountain landscape vertical" node scripts/import-wallpapers.js
//
// Environment:
//   IMPORT_LIMIT          max new files this run (default 50, hard max 100)
//   IMPORT_TARGET_TOTAL   maximum Commons imports overall (default 2000)
//   IMPORT_QUERIES        optional comma-separated query override
//   IMPORT_CATEGORY       category used with IMPORT_QUERIES (default Nature)
//   IMPORT_MIN_LONG_EDGE  minimum source long edge in pixels (default 1600)
//   IMPORT_MIN_SHORT_EDGE minimum source short edge in pixels (default 900)
//   IMPORT_MAX_EDGE       maximum output edge in pixels (default 1920)
//   IMPORT_DRY_RUN        set to 1 to search/filter without writing images

const fs = require("fs");
const { execFileSync } = require("child_process");
const path = require("path");
const sharp = require("sharp");
const { decode } = require("html-entities");

sharp.cache(false);
sharp.concurrency(1);

const API_URL = "https://commons.wikimedia.org/w/api.php";
const SOURCE = "commons";
function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
const LIMIT = Math.min(100, positiveInteger(process.env.IMPORT_LIMIT, 50));
const TARGET_TOTAL = positiveInteger(process.env.IMPORT_TARGET_TOTAL, 2000);
const MIN_LONG_EDGE = Math.max(1000, positiveInteger(process.env.IMPORT_MIN_LONG_EDGE, 1600));
const MIN_SHORT_EDGE = Math.max(600, positiveInteger(process.env.IMPORT_MIN_SHORT_EDGE, 900));
const MAX_EDGE = Math.max(1000, positiveInteger(process.env.IMPORT_MAX_EDGE, 1920));
const DRY_RUN = process.env.IMPORT_DRY_RUN === "1";
const LEDGER_PATH = "imported.json";
const MAX_SEARCH_PAGES = 8;
const USER_AGENT =
  "wallpapers-CDN importer/2.0 (https://github.com/AMRITO-KUNDU/wallpapers-CDN; contact via GitHub)";
const DEFAULT_SEARCHES = [
  { category: "Nature", query: "mountain landscape", terms: ["mountain", "mountains", "alpine", "summit", "peak"] },
  { category: "Nature", query: "forest waterfall", terms: ["forest", "woodland", "rainforest", "waterfall", "cascade"] },
  { category: "Nature", query: "beach coast", terms: ["beach", "coast", "coastline", "seashore", "ocean"] },
  { category: "Nature", query: "desert dunes", terms: ["desert", "dune", "dunes", "sahara", "namib"] },
  { category: "Nature", query: "flower closeup", terms: ["flower", "blossom", "bloom", "rose", "tulip", "orchid"] },
  { category: "Nature", query: "lake mountains", terms: ["lake", "lakes", "mountain", "mountains", "alpine"] },
  { category: "Nature", query: "river canyon", terms: ["river", "canyon", "gorge", "waterfall"] },
  { category: "Nature", query: "autumn forest", terms: ["autumn", "fall foliage", "forest", "woodland"] },
  { category: "Nature", query: "volcano landscape", terms: ["volcano", "volcanic", "lava", "crater"] },
  { category: "Nature", query: "island coastline", terms: ["island", "coast", "coastline", "beach"] },
  { category: "Nature", query: "night sky stars", terms: ["night sky", "milky way", "stars", "aurora", "astronomy"] },
  { category: "Cities", query: "city skyline architecture", terms: ["city", "skyline", "skyscraper"] },
  { category: "Cities", query: "historic buildings street", terms: ["historic", "architecture", "building", "buildings", "street"] },
  { category: "Cities", query: "temple architecture", terms: ["temple", "temples", "pagoda", "shrine"] },
  { category: "Cities", query: "bridge city river", terms: ["bridge", "bridges", "viaduct"] },
  { category: "Travel", query: "Taj Mahal India", terms: ["taj mahal"] },
  { category: "Travel", query: "Machu Picchu Peru", terms: ["machu picchu"] },
  { category: "Travel", query: "Great Wall China", terms: ["great wall"] },
  { category: "Travel", query: "Eiffel Tower Paris", terms: ["eiffel tower"] },
  { category: "Travel", query: "Kyoto shrine Japan", terms: ["kyoto", "shrine", "torii"] },
  { category: "Travel", query: "Marrakech medina Morocco", terms: ["marrakech", "medina"] },
  { category: "Wildlife", query: "wildlife bird", terms: ["wildlife", "bird", "egret", "eagle", "owl"] },
  { category: "Wildlife", query: "butterfly insect", terms: ["butterfly", "moth"] },
  { category: "Wildlife", query: "elephant tiger wildlife", terms: ["elephant", "tiger", "lion", "wildlife"] },
  { category: "Wildlife", query: "deer mammal forest", terms: ["deer", "elk", "moose", "mammal"] },
  { category: "Space", query: "planet earth space", terms: ["planet", "earth", "moon", "saturn", "jupiter"] },
  { category: "Space", query: "nebula galaxy stars", terms: ["nebula", "galaxy", "star cluster", "milky way"] }
];
const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "image", "photo",
  "photograph", "photography", "vertical", "landscape", "view", "taken", "into",
  "over", "about", "which", "were", "was", "have", "has", "its", "original",
  "file", "commons", "wikimedia", "public", "domain", "license", "creative",
  "common", "work", "uploaded", "upload", "cc", "by", "sa", "high", "resolution",
  "landscape", "portrait", "vertical", "closeup", "photo", "photograph", "photography"
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function safeCategory(value) {
  const category = String(value || "Nature").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9 _-]{0,39}$/.test(category)) {
    throw new Error(`Unsafe category name: ${category}`);
  }
  return category;
}

function slugify(value, max = 56) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

function htmlText(value) {
  return decode(String(value || ""))
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/(?:div|p|li|span)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metadataValue(metadata, key) {
  const item = metadata && metadata[key];
  return htmlText(item && typeof item === "object" ? item.value : item);
}

function recognizedLicense(metadata) {
  const label = metadataValue(metadata, "LicenseShortName").replace(/\s+/g, " ").trim();
  const cc0 = /^CC0(?:\s+1\.0)?$/i.test(label);
  const publicDomain = /^(?:Public domain|PD)(?:\b|\s|[-(])/i.test(label);
  const ccBy = /^CC BY(?:-SA)?\s+(?:1\.0|2\.0|2\.5|3\.0|4\.0)(?:\s+[A-Z]{2})?$/i.test(label);
  if (!cc0 && !publicDomain && !ccBy) return null;

  let licenseUrl = metadataValue(metadata, "LicenseUrl");
  licenseUrl = licenseUrl.replace(/^http:\/\//i, "https://");
  if (!licenseUrl && cc0) licenseUrl = "https://creativecommons.org/publicdomain/zero/1.0/";
  if (!licenseUrl && ccBy) {
    const match = label.match(/^CC BY(-SA)?\s+(1\.0|2\.0|2\.5|3\.0|4\.0)/i);
    if (match) {
      const family = match[1] ? "by-sa" : "by";
      licenseUrl = `https://creativecommons.org/licenses/${family}/${match[2]}/`;
    }
  }
  return { label, licenseUrl };
}

function allowedImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["upload.wikimedia.org", "thumb.wikimedia.org"].includes(url.hostname);
  } catch (_) {
    return false;
  }
}

function loadLedger() {
  if (!fs.existsSync(LEDGER_PATH)) return {};
  const raw = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${LEDGER_PATH} must contain a JSON object.`);
  }
  return raw;
}

function findCommonsSourceIds() {
  const ids = new Set();
  function visit(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(filePath);
        continue;
      }
      if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".json") continue;
      try {
        const sidecar = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const sourceId = sidecar && sidecar.sourceId;
        const isCommons = sidecar && sidecar.credit && sidecar.credit.source === "Wikimedia Commons";
        const imagePath = path.join(path.dirname(filePath), `${path.parse(filePath).name}.webp`);
        if (isCommons && sourceId != null && fs.existsSync(imagePath)) ids.add(String(sourceId));
      } catch (_) {
        // The catalog validator reports malformed sidecars; ignore them here.
      }
    }
  }
  visit("wallpapers");
  return Array.from(ids).sort();
}

function getSearches() {
  if (process.env.IMPORT_QUERIES) {
    const category = safeCategory(process.env.IMPORT_CATEGORY || "Nature");
    return process.env.IMPORT_QUERIES.split(",")
      .map(query => query.trim())
      .filter(Boolean)
      .map(query => ({
        category,
        query,
        terms: query.toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length > 3 && !STOPWORDS.has(word))
      }));
  }
  return DEFAULT_SEARCHES;
}

function makeApiUrl(query, continuation) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "50",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: String(MAX_EDGE)
  });
  if (continuation) {
    for (const [key, value] of Object.entries(continuation)) params.set(key, value);
  }
  return `${API_URL}?${params.toString()}`;
}

function httpGetBuffer(url, maxBuffer = 40 * 1024 * 1024) {
  const args = [
    "-fSsL", "--compressed", "--max-time", "90", "--retry", "2",
    "--retry-delay", "1", "--max-filesize", "32000000", "-A", USER_AGENT, url
  ];
  try {
    return execFileSync("curl", args, { maxBuffer });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(`download failed: ${stderr}`);
  }
}

async function fetchJson(url) {
  const raw = httpGetBuffer(url, 48 * 1024 * 1024).toString("utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Commons API returned invalid JSON: ${error.message}`);
  }
  if (data.error) throw new Error(`Commons API error: ${data.error.info || data.error.code}`);
  return data;
}

function parseCandidate(page, subjectTerms) {
  const info = page.imageinfo && page.imageinfo[0];
  if (!info) return null;
  const metadata = info.extmetadata || {};
  const license = recognizedLicense(metadata);
  if (!license) return null;
  if (!/^image\/(?:jpeg|png|webp|tiff|bmp|avif)$/i.test(info.mime || "")) return null;
  if (!info.width || !info.height) return null;
  const longEdge = Math.max(info.width, info.height);
  const shortEdge = Math.min(info.width, info.height);
  const aspect = info.height / info.width;
  if (info.height <= info.width || aspect < 1.18 || aspect > 3) return null;
  if (longEdge < MIN_LONG_EDGE || shortEdge < MIN_SHORT_EDGE) return null;
  const imageUrl = info.thumburl || info.url;
  if (!allowedImageUrl(imageUrl)) return null;
  if (!info.descriptionurl || !/^https:\/\/commons\.wikimedia\.org\//i.test(info.descriptionurl)) return null;

  const objectName = metadataValue(metadata, "ObjectName");
  const rawTitle = objectName || page.title || "";
  const title = rawTitle
    .replace(/^File:/i, "")
    .replace(/\s+QS:[\s\S]*$/i, "")
    .replace(/_/g, " ")
    .replace(/\.(?:jpe?g|png|webp|tiff?|bmp|avif)$/i, "")
    .trim();
  if (!title) return null;
  const description = metadataValue(metadata, "ImageDescription");
  const relevanceText = `${title} ${description}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (!subjectTerms.some(term => relevanceText.includes(term.toLowerCase()))) return null;
  let author = metadataValue(metadata, "Artist") || metadataValue(metadata, "Credit");
  if ((!author || /^(?:unknown|anonymous|unknown author|author unknown)$/i.test(author)) && /^CC BY(?:-SA)?\b/i.test(license.label)) return null;
  if (!author) author = "Creator not stated (public-domain/CC0 file)";

  return {
    sourceId: String(page.pageid || page.title),
    title,
    author,
    license: license.label,
    licenseUrl: license.licenseUrl,
    descriptionUrl: info.descriptionurl,
    imageUrl,
    width: info.width,
    height: info.height
  };
}

async function *searchCandidates(query, subjectTerms) {
  let continuation = null;
  for (let pageNumber = 0; pageNumber < MAX_SEARCH_PAGES; pageNumber++) {
    let data;
    try {
      data = await fetchJson(makeApiUrl(query, continuation));
    } catch (error) {
      console.warn(`  search failed for ${JSON.stringify(query)}: ${error.message}`);
      return;
    }
    const pages = Object.values((data.query && data.query.pages) || {})
      .sort((a, b) => (a.index || 0) - (b.index || 0));
    for (const page of pages) {
      const candidate = parseCandidate(page, subjectTerms);
      if (candidate) yield candidate;
    }
    continuation = data.continue || null;
    if (!continuation) break;
    await sleep(250);
  }
}

function buildTags(candidate, query, category) {
  const tags = [];
  const add = value => {
    const tag = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!tag || tag.length < 3 || tag.length > 30 || STOPWORDS.has(tag)) return;
    if (/^[0-9]+$/.test(tag) || /^[a-z]{0,3}[0-9]+$/.test(tag)) return;
    if (!tags.includes(tag)) tags.push(tag);
  };
  add(category);
  for (const word of query.split(/[^a-zA-Z0-9]+/)) add(word);
  for (const word of candidate.title.split(/[^a-zA-Z0-9]+/)) add(word);
  return tags.slice(0, 10).join(", ");
}

async function processCandidate(candidate, category, query) {
  const folder = path.join("wallpapers", category);
  const base = `${slugify(candidate.title, 48) || "commons-image"}-${candidate.sourceId}`;
  const imagePath = path.join(folder, `${base}.webp`);
  const sidecarPath = path.join(folder, `${base}.json`);
  if (fs.existsSync(imagePath) || fs.existsSync(sidecarPath)) {
    let complete = false;
    if (fs.existsSync(imagePath) && fs.existsSync(sidecarPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(sidecarPath, "utf8"));
        complete = String(existing.sourceId) === String(candidate.sourceId) &&
          existing.credit && existing.credit.source === "Wikimedia Commons" &&
          existing.credit.url === candidate.descriptionUrl;
      } catch (_) {
        complete = false;
      }
    }
    if (complete) return { skipped: "already on disk" };
    for (const stalePath of [imagePath, sidecarPath]) {
      if (fs.existsSync(stalePath)) fs.unlinkSync(stalePath);
    }
  }

  const buffer = httpGetBuffer(candidate.imageUrl);
  if (buffer.length > 32 * 1024 * 1024) return { skipped: "download too large" };
  const output = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 83, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  const orientedWidth = output.info.width;
  const orientedHeight = output.info.height;
  if (!orientedHeight || orientedHeight <= orientedWidth) return { skipped: "not portrait after orientation" };
  if (Math.max(orientedWidth, orientedHeight) < MIN_LONG_EDGE || Math.min(orientedWidth, orientedHeight) < MIN_SHORT_EDGE) {
    return { skipped: "output below minimum dimensions" };
  }

  const credit = {
    author: candidate.author,
    license: candidate.license,
    source: "Wikimedia Commons",
    url: candidate.descriptionUrl,
    changes: "Converted to WebP and resized without cropping; composition preserved."
  };
  if (candidate.licenseUrl) credit.licenseUrl = candidate.licenseUrl;
  const sidecar = {
    sourceId: String(candidate.sourceId),
    title: candidate.title,
    tags: buildTags(candidate, query, category),
    credit
  };
  fs.mkdirSync(folder, { recursive: true });
  const tempSuffix = `.tmp-${process.pid}-${Date.now()}`;
  const tempImagePath = `${imagePath}${tempSuffix}`;
  const tempSidecarPath = `${sidecarPath}${tempSuffix}`;
  try {
    fs.writeFileSync(tempImagePath, output.data, { flag: "wx" });
    fs.writeFileSync(tempSidecarPath, JSON.stringify(sidecar, null, 2) + "\n", { flag: "wx" });
    fs.renameSync(tempImagePath, imagePath);
    fs.renameSync(tempSidecarPath, sidecarPath);
  } catch (error) {
    for (const tempPath of [tempImagePath, tempSidecarPath]) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
    if (fs.existsSync(imagePath) && !fs.existsSync(sidecarPath)) fs.unlinkSync(imagePath);
    throw error;
  }
  return {
    added: {
      file: path.relative("wallpapers", imagePath),
      size: `${output.info.width}x${output.info.height}`,
      kb: Math.round(output.data.length / 1024),
      license: candidate.license
    }
  };
}

async function main() {
  const searches = getSearches();
  const ledger = loadLedger();
  const imported = findCommonsSourceIds();
  ledger[SOURCE] = imported;
  if (!DRY_RUN) fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + "\n");
  const importedSet = new Set(imported.map(String));
  const remaining = Math.max(0, TARGET_TOTAL - importedSet.size);
  if (remaining === 0) {
    console.log(`Commons import target reached: ${importedSet.size}/${TARGET_TOTAL}.`);
    return;
  }
  const runLimit = Math.min(LIMIT, remaining);
  console.log(`Source: Wikimedia Commons | batch: ${runLimit} | lifetime target: ${TARGET_TOTAL}`);
  console.log(`Quality filter: portrait, >=${MIN_LONG_EDGE}px long edge, >=${MIN_SHORT_EDGE}px short edge; CC0/public domain/CC BY/CC BY-SA only.`);
  if (DRY_RUN) console.log("DRY RUN: files and ledger will not be written.");

  let added = 0;
  let examined = 0;
  const skips = {};
  const perSearchQuota = Math.max(1, Math.ceil(runLimit / searches.length));
  outer: for (const search of searches) {
    const category = safeCategory(search.category);
    console.log(`\nSearch: ${search.query} → ${category}`);
    let addedFromSearch = 0;
    for await (const candidate of searchCandidates(search.query, search.terms)) {
      if (added >= runLimit) break outer;
      if (importedSet.has(candidate.sourceId)) continue;
      examined++;
      try {
        const result = DRY_RUN
          ? { added: { file: candidate.title, size: `${candidate.width}x${candidate.height}`, license: candidate.license } }
          : await processCandidate(candidate, category, search.query);
        if (result.added) {
          added++;
          addedFromSearch++;
          if (!DRY_RUN) {
            imported.push(candidate.sourceId);
            importedSet.add(candidate.sourceId);
            ledger[SOURCE] = imported;
            fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + "\n");
          }
          console.log(`  + [${added}/${runLimit}] ${result.added.file} (${result.added.size}; ${result.added.license})`);
        } else {
          skips[result.skipped] = (skips[result.skipped] || 0) + 1;
        }
      } catch (error) {
        const key = `error: ${error.message.slice(0, 70)}`;
        skips[key] = (skips[key] || 0) + 1;
      }
      await sleep(200);
      if (addedFromSearch >= perSearchQuota) break;
    }
  }

  console.log(`\nFinished: ${added} added after examining ${examined} new candidates. Commons total: ${DRY_RUN ? importedSet.size + added : importedSet.size}/${TARGET_TOTAL}.`);
  for (const [reason, count] of Object.entries(skips)) console.log(`  skipped ${count}× ${reason}`);
  if (added === 0) console.log("No new eligible files found in the configured searches.");
}

main().catch(error => {
  console.error("Importer failed:", error.message);
  process.exit(1);
});
