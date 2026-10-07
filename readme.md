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
    "format": "jpeg"
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

## 📜 License

MIT

Please only upload wallpapers you have the legal right to distribute.
