const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_DIR = "wallpapers";
const REPO = process.env.GITHUB_REPOSITORY || "AMRITO-KUNDU/wallpapers-CDN";
const BRANCH = process.env.GITHUB_REF_NAME || process.env.GITHUB_BRANCH || "main";

const BASE_URL = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/${SOURCE_DIR}`;
const THUMBNAIL_BASE_URL = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}/thumbnails`;

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

    const id = generateId(category, filePath);
    const name = path.parse(entry.name).name
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
    const orientation = metadata.width && metadata.height 
      ? getOrientation(metadata.width, metadata.height)
      : null;

    const wallpaper = {
      id: id,
      name: name,
      category: category.toLowerCase(),
      url: `${BASE_URL}/${category}/${entry.name}`,
      thumbnail: `${THUMBNAIL_BASE_URL}/${category}/${path.parse(entry.name).name}.webp`,
      width: metadata.width,
      height: metadata.height,
      orientation: orientation,
      format: metadata.format
    };

    wallpapers.push(wallpaper);
    console.log(`Processed: ${category}/${entry.name} -> ${id}`);
  }

  return wallpapers;
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory not found: ${SOURCE_DIR}`);
  }

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

  // Sort all wallpapers by category, then by id
  allWallpapers.sort((a, b) => {
    const catCompare = a.category.localeCompare(b.category);
    if (catCompare !== 0) return catCompare;
    return a.id.localeCompare(b.id);
  });

  fs.writeFileSync("images.json", JSON.stringify(allWallpapers, null, 2));
  console.log(`\n✔ Generated images.json with ${allWallpapers.length} wallpapers across ${categories.length} categories.`);
}

main().catch(error => {
  console.error("Error:", error);
  process.exit(1);
});
