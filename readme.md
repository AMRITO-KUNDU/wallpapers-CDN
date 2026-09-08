# Wallpaper CDN (imgjson)

A dead-simple wallpaper CDN powered by GitHub.

Drop images into folders → push → get a ready-to-use JSON index.  
No backend. No database. No setup. Just plug and play.

---

## Quick Start (for apps)

### 1. Get the JSON

**Recommended (faster, global CDN):**
```
https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/images.json
```

**Direct from GitHub:**
```
https://raw.githubusercontent.com/AMRITO-KUNDU/wallpapers-CDN/main/images.json
```

### 2. Use it

```js
// Plain JavaScript / Web
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

The JSON looks like this:

```json
[
  {
    "category": "Nature",
    "files": [
      {
        "name": "nature-mountain-lake.jpg",
        "url": "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/Nature/nature-mountain-lake.jpg"
      }
    ]
  }
]
```

Just use the `url` field directly in your `Image` / `NetworkImage` / etc.

---

## Features

- Organized by category folders
- Auto-generated `images.json`
- Fast delivery via jsDelivr CDN
- Works with any platform that can make HTTP requests
- Completely free
- Zero configuration for users of the CDN

---

## Repository Structure

```text
.
├── wallpapers/
│   ├── Anime/
│   ├── Abstract/
│   ├── Nature/
│   ├── Quotes/
│   ├── Space/
│   └── ...
├── images.json          ← auto-generated
└── .github/workflows/
    └── generate-image-json.yml
```

Each folder inside `wallpapers/` is a category.

---

## How it works

1. You add or remove images inside `wallpapers/`
2. You push to GitHub
3. GitHub Action runs automatically
4. It scans every category and builds a fresh `images.json`
5. The updated JSON is committed back

Your apps always get the latest list.

---

## Adding new wallpapers (for you)

1. Create a new folder under `wallpapers/` (or use an existing one)
2. Drop your images (`.jpg`, `.jpeg`, `.png`, `.webp`)
3. Commit and push

That’s it. No manual JSON editing needed.

**Tips for clean results:**
- Use Title Case for folder names (`Nature`, `Anime`, `Abstract`)
- Use kebab-case for filenames (`gojo-satoru.jpg`, `rocky-mountain-evening.jpg`)
- Avoid spaces in filenames

---

## Supported formats

- JPG / JPEG
- PNG
- WebP

---

## License

MIT

Please only upload wallpapers you have the right to distribute.
