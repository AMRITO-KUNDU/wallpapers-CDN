const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_DIR = "wallpapers";
const THUMBNAIL_DIR = "thumbnails";

const SUPPORTED = [".jpg", ".jpeg", ".png", ".webp"];

async function processDirectory(directory) {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const sourcePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(sourcePath);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!SUPPORTED.includes(extension)) {
      continue;
    }

    const relativePath = path.relative(
      SOURCE_DIR,
      sourcePath
    );

    const thumbnailPath = path.join(
      THUMBNAIL_DIR,
      relativePath.replace(/\.[^.]+$/, ".webp")
    );

    fs.mkdirSync(path.dirname(thumbnailPath), {
      recursive: true
    });

    await sharp(sourcePath)
      .resize({
        width: 480,
        withoutEnlargement: true
      })
      .webp({
        quality: 80
      })
      .toFile(thumbnailPath);

    console.log(`Generated: ${thumbnailPath}`);
  }
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error("wallpapers directory not found");
  }

  // Completely rebuild thumbnails.
  // This automatically removes thumbnails for deleted wallpapers.
  if (fs.existsSync(THUMBNAIL_DIR)) {
    fs.rmSync(THUMBNAIL_DIR, {
      recursive: true,
      force: true
    });
  }

  fs.mkdirSync(THUMBNAIL_DIR, {
    recursive: true
  });

  await processDirectory(SOURCE_DIR);

  console.log("Thumbnail generation complete.");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});