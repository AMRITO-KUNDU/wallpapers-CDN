# Wallpaper CDN

A lightweight wallpaper CDN powered by GitHub.

Drop images into folders → push → get a ready-to-use JSON index.  
No backend. No database. No setup. Just plug and play.

## ✨ Features

- 📁 Organized wallpapers by category
- 🖼️ Fast image delivery via jsDelivr CDN
- 📄 Automatically generated `images.json`
- 🔄 Auto-updates whenever wallpapers are added or removed
- 🌐 Works with Android, iOS, Flutter, React Native, Web, Desktop
- 🚀 No backend or database required
- 🆓 Completely free

---

## 🚀 Quick Start

### 1. Fetch the JSON

**Recommended (faster):**
```
https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/images.json
```

**Direct from GitHub:**
```
https://raw.githubusercontent.com/AMRITO-KUNDU/wallpapers-CDN/main/images.json
```

### 2. Use it in your app

```js
// JavaScript / Web
fetch("https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/images.json")
  .then(res => res.json())
  .then(data => console.log(data));
```

```dart
// Flutter
final response = await http.get(Uri.parse(
  "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/images.json"
));
final data = jsonDecode(response.body);
```

```js
// React Native
const response = await fetch(
  "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/images.json"
);
const data = await response.json();
```

---

## 📂 Repository Structure

```text
.
├── wallpapers/
│   ├── Anime/
│   ├── Abstract/
│   ├── Nature/
│   ├── Quotes/
│   ├── Space/
│   └── ...
├── images.json
└── .github/
    └── workflows/
        └── generate-image-json.yml
```

Each folder inside `wallpapers/` is a category.

---

## 📄 JSON Format

```json
[
  {
    "id": "nature-pexels-jack-redgate-333633-2929211",
    "name": "Pexels Jack Redgate 333633 2929211",
    "category": "nature",
    "url": "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/nature/pexels-jack-redgate-333633-2929211.jpg",
    "thumbnail": "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/nature/pexels-jack-redgate-333633-2929211.webp",
    "width": 2912,
    "height": 3640,
    "orientation": "portrait",
    "format": "jpeg",
    "tags": ["nature", "forest", "mist"]
  }
]
```

| Field         | Description                                 |
|---------------|---------------------------------------------|
| `id`          | Stable wallpaper identifier                  |
| `name`        | Human-readable wallpaper name               |
| `category`    | Category slug (for example: `nature`)       |
| `url`         | Direct full-size image URL                   |
| `thumbnail`   | Direct thumbnail or WebP preview URL         |
| `width`       | Image width in pixels                       |
| `height`      | Image height in pixels                      |
| `orientation` | `portrait`, `landscape`, or `square`        |
| `format`      | Image format such as `jpeg` or `png`        |
| `tags`        | Search tags; always includes the category   |
| `credit`      | Optional author, source, license, license link, and changes |

---

## 🏷️ Tags & Search

Every wallpaper is tagged with its category automatically, so the index is
searchable from day one. To add your own tags, edit `tags.json` in the repo
root and write them **separated by commas**, keyed by the wallpaper `id`:

```json
{
  "anime-gojo-satoru": "gojo, jujutsu kaisen, blue, dark",
  "nature-pexels-jack-redgate-333633-2929211": "forest, mist, green, desktop"
}
```

Push, and the Action regenerates `images.json` with those tags merged in. You
never touch the generated file.

The build also produces **`tags-index.json`** — every tag with how many
wallpapers use it, most-used first — so an app can draw a filter bar without
loading the whole catalog:

```json
{ "tag": "forest", "count": 3, "categories": ["nature"] }
```

Tag rules, in short: tags are lowercased and trimmed for you, duplicates are
collapsed, and the category is always included. Prefer spaces over hyphens for
multi-word tags. If you rename a wallpaper file, its `tags.json` entry no longer
matches and the Action prints a warning listing the orphaned key.

---

## 🎨 Where The Wallpapers Come From

The catalog combines your own uploads, original generated designs, and
attribution-tracked images from Wikimedia Commons.

```bash
npm run generate-wallpapers
```

`scripts/generate-procedural-wallpapers.js` renders original wallpapers at
**1440×3120 portrait** — soft mesh gradients and glowing orbs across 16 palettes,
with a film grain layer that stops dark gradients from banding. They are the
repo's own work under MIT: no licence, no attribution requirement, no takedown
risk, and every single one is phone-shaped.

### Global image imports

The `Import Commons Wallpapers` GitHub Action searches Commons daily and adds up
to 50 new eligible images per run, stopping after 2,000 imports. It also has a
manual dispatch option for a one-off batch of up to 100. The importer searches
categories such as nature, wildlife, cities, travel, and space, and only accepts
portrait images with enough pixels for a phone wallpaper.

It filters for file-page licenses marked **CC0, public domain, CC BY, or CC
BY-SA**; unknown, non-commercial, and no-derivatives licenses are rejected.
Each image is converted to WebP and resized without cropping. Its sidecar and
`images.json` credit retain the creator, Commons file page, license, license
link, and conversion note. Downloads are tracked in `imported.json` to avoid
re-importing the same file.

Imported images keep their individual source licenses; the repository's MIT license
does not replace them. Commons advises reusers to follow each file's terms and
consider non-copyright restrictions such as privacy or personality rights
([licensing](https://commons.wikimedia.org/wiki/Commons:Licensing),
[reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia)).
The importer preserves source and attribution details, but the Commons metadata
is not a legal warranty. Pexels, Unsplash, and Pixabay are not used for bulk
imports because their terms restrict compiling their catalogs into competing
wallpaper services.

---

## ⚙️ How It Works

1. You add or remove images inside `wallpapers/`
2. You push to GitHub
3. GitHub Action runs automatically
4. It scans every category, reads image metadata, and generates a fresh `images.json`
5. The updated JSON is committed back to the repository

Your apps always receive the latest wallpapers.

---

## 🖼️ Supported Image Formats

- JPG / JPEG
- PNG
- WebP

---

## 🤝 Adding New Wallpapers

1. Create a new folder under `wallpapers/` (or use an existing one)
2. Drop your images inside it
3. Commit and push

GitHub Actions will automatically update `images.json`.  
No manual editing required.

---

## 🧹 Repository history

This repo keeps **no history**. `main` is a single root commit, and
[`.github/workflows/squash-history.yml`](.github/workflows/squash-history.yml)
collapses it back to one commit every Sunday at 04:00 UTC, or on demand from the
Actions tab.

Every import, dedupe or thumbnail rebuild otherwise adds a commit, and each one
stores a fresh copy of `images.json`, `tags-index.json` and the thumbnails. That
pack grows without bound and eventually pushes the repository past the CDN's
size ceiling, at which point jsDelivr starts refusing files that are not already
in its cache.

Consequences worth knowing: `git log` shows one commit, old commit links and
forks of earlier revisions no longer resolve, and `git clone` always fetches the
current tree only.

Note that collapsing history does **not** make the repository small by itself —
what the CDN measures is the current tree, not the history. If the tree itself
grows past the limit, the fix is to move the image bytes out of git (for example
to Cloudflare R2 or Supabase Storage) and keep this repository as the manifest.

---

## 📜 License

MIT

Please only upload wallpapers you have the legal right to distribute.
