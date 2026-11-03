#!/usr/bin/env node
// Finds (and optionally removes) near-duplicate wallpapers within a category.
//
// Two images are treated as near-duplicates only when BOTH of these are true:
//
//   1. Structure is close - compared with a 64-bit dHash (the image is reduced
//      to a 9x8 greyscale thumbnail and each bit records whether a pixel is
//      brighter than the one to its right).
//   2. Colour is close - compared with the mean RGB of a 16x16 thumbnail.
//
// Checking structure alone is not enough. dHash works on luminance, so a violet
// orb and a candy orb with the same shape score as identical even though they
// are obviously different wallpapers. The colour test is what stops that.
//
// Usage:
//   node scripts/dedupe-wallpapers.js                    # report only
//   node scripts/dedupe-wallpapers.js --apply            # delete duplicates
//   node scripts/dedupe-wallpapers.js --threshold 6      # stricter structure match
//   node scripts/dedupe-wallpapers.js --color 14         # stricter colour match
//   node scripts/dedupe-wallpapers.js Abstract --apply   # limit to one category
//
// The first file of each cluster is kept; the rest are reported, or removed
// along with their .json sidecar.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

sharp.cache(false);
sharp.concurrency(1);

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const numArg = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i > -1 ? Number(args[i + 1]) : fallback;
};
const THRESHOLD = numArg("--threshold", 8);
const COLOR_T = numArg("--color", 20);
const category = args.find(a => !a.startsWith("--") && !/^\d+$/.test(a));

const ROOT = "wallpapers";
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function fingerprint(file) {
  const { data: grey } = await sharp(file)
    .greyscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let bits = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits = (bits << 1n) | (grey[y * 9 + x] > grey[y * 9 + x + 1] ? 1n : 0n);
    }
  }

  const { data: rgb } = await sharp(file)
    .resize(16, 16, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0, g = 0, b = 0;
  const n = rgb.length / 3;
  for (let i = 0; i < rgb.length; i += 3) {
    r += rgb[i];
    g += rgb[i + 1];
    b += rgb[i + 2];
  }

  return { hash: bits, color: [r / n, g / n, b / n] };
}

function hamming(a, b) {
  let v = a ^ b;
  let count = 0;
  while (v) {
    v &= v - 1n;
    count++;
  }
  return count;
}

function colorDistance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function categories() {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT)
    .filter(name => fs.statSync(path.join(ROOT, name)).isDirectory())
    .filter(name => !category || name.toLowerCase() === category.toLowerCase());
}

async function main() {
  const cats = categories();
  if (!cats.length) {
    console.log(`No categories found under ${ROOT}/`);
    return;
  }

  let totalDropped = 0;

  for (const cat of cats) {
    const dir = path.join(ROOT, cat);
    const files = fs
      .readdirSync(dir)
      .filter(f => EXT.has(path.extname(f).toLowerCase()))
      .sort();

    if (files.length < 2) continue;

    const prints = [];
    for (const file of files) prints.push({ file, ...(await fingerprint(path.join(dir, file))) });

    const keep = [];
    const drop = [];
    for (const entry of prints) {
      const twin = keep.find(
        k => hamming(k.hash, entry.hash) <= THRESHOLD && colorDistance(k.color, entry.color) <= COLOR_T
      );
      if (twin) drop.push({ ...entry, twin: twin.file });
      else keep.push(entry);
    }

    if (!drop.length) {
      console.log(`${cat}: ${files.length} files, no near-duplicates (structure <= ${THRESHOLD}, colour <= ${COLOR_T})`);
      continue;
    }

    console.log(`${cat}: ${files.length} files -> ${keep.length} kept, ${drop.length} near-duplicate(s)`);
    for (const d of drop) {
      console.log(
        `  drop ${d.file}  (near ${d.twin}, structure ${hamming(d.hash, keep.find(k => k.file === d.twin).hash)}, colour ${colorDistance(d.color, keep.find(k => k.file === d.twin).color).toFixed(1)})`
      );
      if (apply) {
        fs.rmSync(path.join(dir, d.file), { force: true });
        const sidecar = path.join(dir, d.file.replace(/\.[^.]+$/, ".json"));
        if (fs.existsSync(sidecar)) fs.rmSync(sidecar, { force: true });
      }
    }
    totalDropped += drop.length;
  }

  console.log(
    apply
      ? `\nRemoved ${totalDropped} near-duplicate file(s). Re-run generate-images-json and generate-thumbnails.`
      : `\n${totalDropped} near-duplicate file(s) found. Re-run with --apply to remove them.`
  );
}

main().catch(error => {
  console.error("Error:", error.message);
  process.exit(1);
});
