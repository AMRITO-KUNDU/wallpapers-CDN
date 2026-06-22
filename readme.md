# Wallpaper CDN

A lightweight wallpaper CDN powered by GitHub.

This repository hosts wallpapers organized into categories and automatically generates a JSON index (`images.json`) that any application can consume. It requires no backend server or database—GitHub and GitHub Actions handle everything automatically.

## ✨ Features

- 📁 Organized wallpapers by category
- 🖼️ Direct image URLs via GitHub Raw
- 📄 Automatically generated `images.json`
- 🔄 Auto-updates whenever wallpapers are added, removed, or modified
- 🌐 Works with Android, iOS, Flutter, React Native, Web, Desktop, and more
- 🚀 No backend or database required
- 🆓 Free hosting using GitHub

---

## 📂 Repository Structure

```text
.
├── wallpapers
│   ├── Anime
│   ├── Nature
│   ├── Quotes
│   ├── Space
│   └── ...
├── images.json
└── .github
    └── workflows
        └── generate-image-json.yml
```

Each folder inside `wallpapers/` represents a wallpaper category.

---

## ⚙️ How It Works

Whenever changes are pushed to the `wallpapers/` directory:

1. GitHub Actions automatically starts.
2. Every category is scanned.
3. All supported image files are detected.
4. A new `images.json` is generated.
5. The updated JSON file is automatically committed back to the repository.

This means the index always stays synchronized with the wallpapers.

---

## 📄 JSON Format

Example:

```json
[
  {
    "category": "Nature",
    "files": [
      {
        "name": "mountain.jpg",
        "url": "https://raw.githubusercontent.com/<owner>/<repository>/main/wallpapers/Nature/mountain.jpg"
      }
    ]
  }
]
```

### Fields

| Field | Description |
|-------|-------------|
| `category` | Wallpaper category name |
| `files` | Wallpapers inside the category |
| `name` | Original filename |
| `url` | Direct image URL |

---

## 🚀 Using the CDN

### 1. Fetch the JSON index

```
https://raw.githubusercontent.com/<owner>/<repository>/main/images.json
```

### 2. Parse the JSON

Read the available categories and wallpapers.

### 3. Load the images

Use the `url` field directly to display or download wallpapers.

No authentication or API key is required.

---

## 🖼️ Supported Image Formats

- JPG
- JPEG
- PNG
- WebP

---

## 🔄 Workflow

```text
Push wallpapers
      │
      ▼
GitHub Action runs
      │
      ▼
Scan wallpaper folders
      │
      ▼
Generate images.json
      │
      ▼
Commit updated JSON
      │
      ▼
Applications fetch latest wallpapers
```

---

## 📱 Compatible Platforms

This repository can be used by any application capable of making HTTP requests, including:

- Android
- iOS
- Flutter
- React Native
- Web Applications
- Desktop Applications
- Any custom application

---

## 🤝 Contributing

1. Add images to an existing category inside `wallpapers/`, or create a new category.
2. Commit and push your changes.
3. GitHub Actions will automatically regenerate `images.json`.

No manual editing of the JSON file is necessary.

---

## 📜 License

Please ensure you have the legal right to distribute any wallpapers you contribute. Contributors are responsible for the licensing and ownership of uploaded content.
