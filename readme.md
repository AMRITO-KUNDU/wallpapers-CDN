Wallpaper CDN

A lightweight wallpaper CDN powered by GitHub.

This repository hosts wallpapers organized into categories and automatically generates a JSON index that any application can consume. It requires no backend server or database—GitHub and GitHub Actions handle everything.

Features

- 📁 Organized wallpapers by category
- 🖼️ Direct image URLs
- 📄 Automatically generated "images.json"
- 🔄 Updates automatically when wallpapers are added or modified
- 🌐 Can be used by Android, iOS, Flutter, React Native, Web, Desktop, or any other application
- 🆓 Free hosting using GitHub

---

Repository Structure

wallpapers/
├── Anime/
│   ├── gojo.jpg
│   └── naruto.png
├── Nature/
│   ├── mountain.jpg
│   └── forest.webp
├── Space/
├── Quotes/
└── ...

Each folder represents a wallpaper category.

---

How It Works

This repository uses GitHub Actions to automatically keep the wallpaper index up to date.

Whenever a change is pushed to the "wallpapers/" directory:

1. The workflow scans every category.
2. It detects supported image files.
3. It generates a new "images.json".
4. The updated JSON file is committed back to the repository automatically.

No manual editing of "images.json" is required.

---

Generated JSON

Example:

[
  {
    "category": "Anime",
    "files": [
      {
        "name": "gojo.jpg",
        "url": "https://raw.githubusercontent.com/<owner>/<repo>/main/wallpapers/Anime/gojo.jpg"
      }
    ]
  }
]

Structure

Field| Description
"category"| Wallpaper category
"files"| Wallpapers inside the category
"name"| Original image filename
"url"| Direct image URL

---

Using the CDN

1. Download the JSON index

https://raw.githubusercontent.com/<owner>/<repository>/main/images.json

2. Parse the JSON

Read all available categories and wallpapers.

3. Load wallpapers

Use the provided image URLs directly in your application.

No authentication or API key is required.

---

Supported Formats

- JPG
- JPEG
- PNG
- WebP

---

Workflow

Push wallpapers
       │
       ▼
GitHub Action runs
       │
       ▼
Scan all categories
       │
       ▼
Generate images.json
       │
       ▼
Commit updated JSON
       │
       ▼
Applications fetch latest data

---

Integrating into Your App

The repository is platform-independent and can be used with:

- Android
- iOS
- Flutter
- React Native
- Web Applications
- Desktop Applications
- Any platform capable of making HTTP requests

Simply fetch "images.json", parse it, and display wallpapers using the provided URLs.

---

Contributing

To add wallpapers:

1. Create or choose a category inside "wallpapers/".
2. Add supported image files.
3. Commit and push your changes.

The JSON index will be regenerated automatically by GitHub Actions.

---

License

Please ensure you have the rights to distribute any wallpapers you upload. Contributors are responsible for the licensing of their content.
