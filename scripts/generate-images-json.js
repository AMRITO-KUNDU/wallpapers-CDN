const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_DIR = "wallpapers";
const REPO = process.env.GITHUB_REPOSITORY || "AMRITO-KUNDU/wallpapers-CDN";
const BRANCH = process.env.GITHUB_REF_NAME || process.env.GITHUB_BRANCH || "main";

const BASE_URL = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/${SOURCE_DIR}`;
const THUMBNAIL_BASE_URL = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/thumbnails`;

// Hand-edited: wallpaper id -> comma-separated tags. Never written by this script.
const TAGS_FILE = "tags.json";
// Generated: tag -> count, for building search / filter UI.
const TAGS_INDEX_FILE = "tags-index.json";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function generateId(category, filePath) {
  // Create a stable ID from category and filename to avoid collisions
  const basename = path.basename(filePath);
  const withoutExt = path.parse(basename).name;
  const categoryPart = category.toLowerCase();
  const namePart = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${categoryPart}-${namePart}`;
}

function getOrientation(width, height) {
  if (width > height) {
    return "landscape";
  } else if (height > width) {
    return "portrait";
  } else {
    return "square";
  }
}

function getFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase().replace(/^\./, "");
  // Map common extensions to standard format names
  const formatMap = {
    jpg: "jpg",
    jpeg: "jpg",
    png: "png",
    webp: "webp",
    gif: "gif"
  };
  return formatMap[ext] || ext;
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

/** Trim, drop a leading "#", lowercase, collapse whitespace. */
function normalizeTag(value) {
  return String(value)
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * Accept either "gojo, jujutsu kaisen" (comma separated, what a human writes)
 * or ["gojo", "jujutsu kaisen"], and return clean, de-duplicated, normalized tags.
 */
function parseTags(value) {
  const parts = Array.isArray(value) ? value : String(value == null ? "" : value).split(",");
  const seen = new Set();
  const tags = [];

  for (const part of parts) {
    const tag = normalizeTag(part);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }

  return tags;
}

/**
 * Read tags.json: { "<wallpaper-id>": "tag one, tag two" }.
 * Missing file is fine - every wallpaper then just gets its category as a tag.
 */
function loadTagOverrides() {
  if (!fs.existsSync(TAGS_FILE)) {
    console.log(`No ${TAGS_FILE} found - tagging every wallpaper with its category only.`);
    return {};
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(TAGS_FILE, "utf8"));
  } catch (error) {
    throw new Error(`${TAGS_FILE} is not valid JSON: ${error.message}`);
  }

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(
      `${TAGS_FILE} must be an object keyed by wallpaper id, e.g. { "anime-gojo-satoru": "gojo, jujutsu kaisen" }`
    );
  }

  const overrides = {};
  for (const [id, value] of Object.entries(raw)) {
    const tags = parseTags(value);
    if (tags.length) overrides[id] = tags;
  }

  return overrides;
}

/** Build the tag -> count index that clients use for search and filter UI. */
function buildTagsIndex(wallpapers) {
  const index = new Map();

  for (const wallpaper of wallpapers) {
    for (const tag of wallpaper.tags) {
      const entry = index.get(tag) || { tag, count: 0, categories: new Set() };
      entry.count += 1;
      entry.categories.add(wallpaper.category);
      index.set(tag, entry);
    }
  }

  const tags = Array.from(index.values())
    .map(entry => ({
      tag: entry.tag,
      count: entry.count,
      categories: Array.from(entry.categories).sort()
    }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return {
    generated_from: "images.json",
    wallpaper_count: wallpapers.length,
    tag_count: tags.length,
    tags
  };
}

// ---------------------------------------------------------------------------
// Per-image sidecar
// ---------------------------------------------------------------------------

/**
 * An optional "<image>.json" next to an image can carry extra metadata:
 * { "title": "...", "tags": "a, b", "credit": { ... } }.
 * The importer writes these; you can add one by hand too.
 */
function loadSidecar(filePath) {
  const sidecarPath = path.join(
    path.dirname(filePath),
    `${path.parse(filePath).name}.json`
  );
  if (!fs.existsSync(sidecarPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(sidecarPath, "utf8"));
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      console.warn(`Ignoring ${sidecarPath}: must be a JSON object.`);
      return null;
    }
    return raw;
  } catch (error) {
    console.warn(`Ignoring ${sidecarPath}: ${error.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

async function getImageMetadata(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format || getFormat(filePath)
    };
  } catch (error) {
    console.error(`Error reading metadata for ${filePath}:`, error.message);
    // Fallback to file extension
    return {
      width: null,
      height: null,
      format: getFormat(filePath)
    };
  }
}

async function processCategory(category, categoryPath) {
  const entries = fs.readdirSync(categoryPath, { withFileTypes: true });
  const wallpapers = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const filePath = path.join(categoryPath, entry.name);
    const metadata = await getImageMetadata(filePath);

    const sidecar = loadSidecar(filePath);
    const id = generateId(category, filePath);
    const fallbackName = path.parse(entry.name).name
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
    const name = sidecar && typeof sidecar.title === "string" && sidecar.title.trim()
      ? sidecar.title.trim()
      : fallbackName;
    const orientation = metadata.width && metadata.height
      ? getOrientation(metadata.width, metadata.height)
      : null;

    const wallpaper = {
      id: id,
      name: name,
      category: category.toLowerCase(),
      url: `${BASE_URL}/${encodeURIComponent(category)}/${encodeURIComponent(entry.name)}`,
      thumbnail: `${THUMBNAIL_BASE_URL}/${encodeURIComponent(category)}/${encodeURIComponent(path.parse(entry.name).name)}.webp`,
      width: metadata.width,
      height: metadata.height,
      orientation: orientation,
      format: metadata.format
    };

    // Sidecar tags are merged in main(), after the category tag.
    wallpaper._sidecarTags = sidecar ? parseTags(sidecar.tags) : [];

    // Provenance, when the source provides it. Optional - hand-added
    // wallpapers usually have none.
    if (sidecar && sidecar.credit && typeof sidecar.credit === "object" && !Array.isArray(sidecar.credit)) {
      const credit = {};
      for (const key of ["author", "license", "source", "url", "licenseUrl", "changes"]) {
        const value = sidecar.credit[key];
        if (typeof value === "string" && value.trim()) credit[key] = value.trim();
      }
      if (credit.author || credit.license || credit.source || credit.url) {
        wallpaper.credit = credit;
      }
    }

    wallpapers.push(wallpaper);
    console.log(`Processed: ${category}/${entry.name} -> ${id}`);
  }

  return wallpapers;
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory not found: ${SOURCE_DIR}`);
  }

  const tagOverrides = loadTagOverrides();

  const categories = fs.readdirSync(SOURCE_DIR)
    .filter(name => {
      const fullPath = path.join(SOURCE_DIR, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();

  const allWallpapers = [];

  for (const category of categories) {
    const categoryPath = path.join(SOURCE_DIR, category);
    const wallpapers = await processCategory(category, categoryPath);
    allWallpapers.push(...wallpapers);
    console.log(`Category ${category}: ${wallpapers.length} wallpapers`);
  }

  // Attach tags: the category slug is always the first tag, then anything the
  // author wrote for this id in tags.json. Duplicates are collapsed.
  for (const wallpaper of allWallpapers) {
    const extraTags = tagOverrides[wallpaper.id] || [];
    const sidecarTags = wallpaper._sidecarTags || [];
    delete wallpaper._sidecarTags;
    wallpaper.tags = parseTags([wallpaper.category, ...sidecarTags, ...extraTags]);
  }

  // A tags.json key that matches nothing is almost always a typo or a renamed
  // file - warn instead of silently dropping the author's tags.
  const knownIds = new Set(allWallpapers.map(wallpaper => wallpaper.id));
  const unmatchedIds = Object.keys(tagOverrides).filter(id => !knownIds.has(id));
  if (unmatchedIds.length) {
    console.warn(
      `\nWarning: ${TAGS_FILE} has tags for ids that do not exist in ${SOURCE_DIR}/:\n  ${unmatchedIds.join("\n  ")}`
    );
  }

  // Sort all wallpapers by category, then by id
  allWallpapers.sort((a, b) => {
    const catCompare = a.category.localeCompare(b.category);
    if (catCompare !== 0) return catCompare;
    return a.id.localeCompare(b.id);
  });

  fs.writeFileSync("images.json", JSON.stringify(allWallpapers, null, 2));

  const tagsIndex = buildTagsIndex(allWallpapers);
  fs.writeFileSync(TAGS_INDEX_FILE, JSON.stringify(tagsIndex, null, 2));

  console.log(
    `\n\u2714 Generated images.json with ${allWallpapers.length} wallpapers across ${categories.length} categories.`
  );
  console.log(
    `\u2714 Generated ${TAGS_INDEX_FILE} with ${tagsIndex.tag_count} tags.`
  );
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
