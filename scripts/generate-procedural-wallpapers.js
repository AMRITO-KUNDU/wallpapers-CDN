#!/usr/bin/env node
// Generates original, high-resolution, portrait wallpapers.
//
// No source, no licence, no attribution: these are produced by this repo, so
// they are safe to redistribute and are always phone-shaped (1440x3120), which
// no free photo API reliably gives us.
//
// Usage: node scripts/generate-procedural-wallpapers.js [count-per-palette]

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

sharp.cache(false);
sharp.concurrency(1);

const WIDTH = 1440;
const HEIGHT = 3120;
const OUT_DIR = path.join(process.env.OUT_ROOT || ".", "wallpapers", "Abstract");

// Hand-picked palettes. Each is [base dark, base mid, accent A, accent B, glow].
const PALETTES = [
  { name: "Dusk",      colors: ["#1b1035", "#3b1d5e", "#ff5f8f", "#7c4dff", "#ffd6a5"] },
  { name: "Ocean",     colors: ["#04141f", "#0a3d5c", "#22d3ee", "#2563eb", "#a5f3fc"] },
  { name: "Ember",     colors: ["#1a0b07", "#4a1208", "#f97316", "#dc2626", "#fde68a"] },
  { name: "Forest",    colors: ["#07140d", "#123a24", "#34d399", "#0f766e", "#d9f99d"] },
  { name: "Violet",    colors: ["#120a1f", "#2e1065", "#a855f7", "#6366f1", "#e9d5ff"] },
  { name: "Sand",      colors: ["#1a1208", "#4a2f14", "#f59e0b", "#b45309", "#fef3c7"] },
  { name: "Slate",     colors: ["#0b0f14", "#1e293b", "#94a3b8", "#475569", "#e2e8f0"] },
  { name: "Rose",      colors: ["#1a0710", "#4c0519", "#fb7185", "#be123c", "#ffe4e6"] },
  { name: "Mint",      colors: ["#04140f", "#064e3b", "#6ee7b7", "#14b8a6", "#ecfdf5"] },
  { name: "Indigo",    colors: ["#070b1f", "#1e1b4b", "#818cf8", "#4338ca", "#e0e7ff"] },
  { name: "Candy",     colors: ["#1a0a1f", "#581c87", "#f472b6", "#22d3ee", "#fae8ff"] },
  { name: "Noir",      colors: ["#000000", "#111111", "#3f3f46", "#52525b", "#a1a1aa"] },
  { name: "Lagoon",    colors: ["#02161a", "#0c4a6e", "#2dd4bf", "#0284c7", "#cffafe"] },
  { name: "Copper",    colors: ["#160d06", "#431407", "#ea580c", "#92400e", "#fed7aa"] },
  { name: "Glacier",   colors: ["#060f1a", "#0c4a6e", "#7dd3fc", "#1d4ed8", "#f0f9ff"] },
  { name: "Plum",      colors: ["#14061a", "#4a044e", "#d946ef", "#7e22ce", "#f5d0fe"] },
];

// Deterministic PRNG so the same palette + index always produces the same art.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildOrbSvg(colors, rand) {
  const [base0, base1, a1, a2, glow] = colors;
  const cx = WIDTH * (0.42 + rand() * 0.16);
  const cy = HEIGHT * (0.34 + rand() * 0.18);
  const r = WIDTH * (0.30 + rand() * 0.16);
  const tilt = (rand() * 60 - 30).toFixed(1);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="sky" cx="0.5" cy="0.32" r="0.95">
      <stop offset="0" stop-color="${base1}"/>
      <stop offset="1" stop-color="${base0}"/>
    </radialGradient>
    <radialGradient id="halo" cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(r * 2.4).toFixed(0)}" gradientUnits="userSpaceOnUse">
      <stop offset="0.30" stop-color="${glow}" stop-opacity="0.55"/>
      <stop offset="0.62" stop-color="${a1}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${a1}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb" cx="${(cx - r * 0.30).toFixed(0)}" cy="${(cy - r * 0.34).toFixed(0)}" r="${(r * 1.35).toFixed(0)}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.98"/>
      <stop offset="0.42" stop-color="${a1}" stop-opacity="0.92"/>
      <stop offset="0.82" stop-color="${a2}" stop-opacity="0.88"/>
      <stop offset="1" stop-color="${base0}" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="0.55" stop-color="#000000" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="vig2" cx="0.5" cy="0.5" r="0.78">
      <stop offset="0.5" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.6"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#halo)"/>
  <g transform="rotate(${tilt} ${cx.toFixed(0)} ${cy.toFixed(0)})">
    <circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#orb)"/>
    <circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#shade)"/>
  </g>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vig2)"/>
</svg>`;
}

function buildSvg(colors, rand) {
  const [base0, base1, a1, a2, glow] = colors;

  // Soft overlapping radial gradients read as a mesh gradient, and unlike
  // blur filters they render identically in every SVG rasteriser.
  const blobs = [];
  const count = 4 + Math.floor(rand() * 3);
  const palette = [a1, a2, glow, a1, a2];

  for (let i = 0; i < count; i++) {
    const cx = Math.round((0.1 + rand() * 0.8) * WIDTH);
    const cy = Math.round((0.05 + rand() * 0.9) * HEIGHT);
    const r = Math.round((0.35 + rand() * 0.45) * WIDTH);
    const color = palette[i % palette.length];
    const op = (0.62 + rand() * 0.33).toFixed(2);
    blobs.push(
      `<radialGradient id="b${i}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">` +
        `<stop offset="0" stop-color="${color}" stop-opacity="${op}"/>` +
        `<stop offset="0.4" stop-color="${color}" stop-opacity="${(op * 0.55).toFixed(2)}"/>` +
        `<stop offset="1" stop-color="${color}" stop-opacity="0"/>` +
      `</radialGradient>`
    );
  }

  const fills = blobs
    .map((_, i) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#b${i})"/>`)
    .join("");

  const angle = rand() * 360;
  const rad = (angle * Math.PI) / 180;
  const x2 = (0.5 + Math.cos(rad) * 0.5).toFixed(3);
  const y2 = (0.5 + Math.sin(rad) * 0.5).toFixed(3);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${base0}"/>
      <stop offset="1" stop-color="${base1}"/>
    </linearGradient>
    ${blobs.join("")}
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#base)"/>
  ${fills}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vig)"/>
</svg>`;
}

// Fine grain kills the "flat gradient" look and hides WebP banding in dark
// areas. Generated as raw pixels so it does not depend on SVG filter support.
async function grainLayer(rand) {
  const w = 360, h = 780;
  const buf = Buffer.allocUnsafe(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    // Narrow band around mid-grey: with soft-light this is texture, not noise.
    const v = Math.round(128 + (rand() * 2 - 1) * 16);
    buf[i * 3] = v; buf[i * 3 + 1] = v; buf[i * 3 + 2] = v;
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 3 } })
    .resize(WIDTH, HEIGHT, { kernel: "nearest" })
    .png()
    .toBuffer();
}

// Which style/range to build. Kept deliberately small: more than a couple of
// variants per palette produces wallpapers that differ only in where the
// gradient blobs sit, which reads as the same image repeated. Raise it with the
// STYLES env var if you want more, then run scripts/dedupe-wallpapers.js.
const STYLES = (process.env.STYLES || "mesh:1:2,orb:1:1")
  .split(",")
  .map(spec => {
    const [style, from, count] = spec.split(":");
    return { style, from: Number(from || 1), count: Number(count || 3) };
  });

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let made = 0;
  for (const job of STYLES) {
  for (let p = 0; p < PALETTES.length; p++) {
    const palette = PALETTES[p];
    for (let k = 0; k < job.count; k++) {
      const v = job.from + k;
      const seedBase = job.style === "orb" ? 500000 : 0;
      const rand = mulberry32(seedBase + p * 1000 + v * 37 + 7);
      const svg = job.style === "orb" ? buildOrbSvg(palette.colors, rand) : buildSvg(palette.colors, rand);
      const grain = await grainLayer(rand);

      const slug = `${palette.name.toLowerCase()}-${job.style}-${String(v).padStart(2, "0")}`;
      const outPath = path.join(OUT_DIR, `${slug}.webp`);

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sharp(Buffer.from(svg))
            .composite([{ input: grain, blend: "soft-light" }])
            .webp({ quality: 90, effort: 5 })
            .toFile(outPath);
          break;
        } catch (e) {
          if (attempt === 3) throw e;
          await new Promise(r => setTimeout(r, 300));
        }
      }

      // Sidecar so the index carries a real title and useful tags.
      fs.writeFileSync(
        path.join(OUT_DIR, `${slug}.json`),
        JSON.stringify(
          {
            title: `${palette.name} ${job.style === "orb" ? "Orb" : "Mesh"} ${String(v).padStart(2, "0")}`,
            tags: `abstract, ${job.style === "orb" ? "orb, glow, sphere" : "gradient, mesh"}, ${palette.name.toLowerCase()}, minimal, dark, phone`,
            credit: {
              author: "wallpapers-CDN (generated)",
              license: "MIT",
              source: "Generated by scripts/generate-procedural-wallpapers.js",
              url: "https://github.com/AMRITO-KUNDU/wallpapers-CDN"
            }
          },
          null,
          2
        ) + "\n"
      );

      made++;
      process.stdout.write(`  ${slug} ${(fs.statSync(outPath).size / 1024).toFixed(0)}KB\n`);
    }
  }
  }
  console.log(`\nGenerated ${made} wallpapers in ${OUT_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
