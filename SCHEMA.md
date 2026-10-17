# `images.json` — schema contract

**Version:** 2
**Shape:** a flat JSON array of wallpaper records
**Canonical URL:** `https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/images.json`

This file is the source of truth for the shape of the generated index. Any
client (Walliq, the docs site, a third-party app) depends on this contract, so
treat a change here as an API change, not an internal refactor.

## Record fields

| Field         | Type              | Notes                                                        |
|---------------|-------------------|--------------------------------------------------------------|
| `id`          | string            | Stable, unique. `"<category-slug>-<file-slug>"`.             |
| `name`        | string            | Human-readable display name.                                 |
| `category`    | string            | **Lowercase slug** (e.g. `"anime"`). See the warning below.  |
| `url`         | string            | Absolute, **pre-encoded** URL to the full-size image.        |
| `thumbnail`   | string            | Absolute, **pre-encoded** URL to the WebP thumbnail.         |
| `width`       | number \| null    | Pixels, or `null` if metadata could not be read.             |
| `height`      | number \| null    | Pixels, or `null` if metadata could not be read.             |
| `orientation` | string \| null    | `"portrait"`, `"landscape"`, `"square"`, or `null`.          |
| `format`      | string            | `"jpg"`, `"png"`, `"webp"`, or `"gif"`.                      |

## Invariants

These are enforced by [`scripts/validate-images-json.js`](scripts/validate-images-json.js),
which runs in CI before the index is committed:

1. The top level is a **flat array** (not grouped by category).
2. Every record has non-empty `id`, `name`, `category`, `url`, `thumbnail`, `format`.
3. `width` and `height` are numbers or `null`.
4. `url` and `thumbnail` are absolute `http(s)` URLs.
5. `url` and `thumbnail` contain **no unencoded characters** (spaces, etc.).
   A raw space in a URL fails the request on many clients, so it must be `%20`.
6. `id` values are unique.

## Client guidance

- Use `url` and `thumbnail` **exactly as provided**. Do not build URLs yourself.
- **Do not** reconstruct a URL from `category` + file name. `category` is a
  lowercase slug, but the on-disk folder keeps its original case — `"anime"`
  in the index vs. `Anime` in the path — so a reconstructed path will 404.
- URLs are already percent-encoded; do not re-encode them.

## Versioning policy

- **Additive changes** (new fields, new records) are allowed within a version.
  Clients must ignore unknown fields.
- **Breaking changes** (removing/renaming a field, changing the top-level shape,
  changing the meaning of `category`) require a **new version**, published at a
  new path (e.g. `v3/images.json`) while the current version keeps working.
- The version number lives in this document and in git history. The array
  itself carries no version envelope, so clients should validate the shape they
  receive (see the contract test in the Walliq repo) rather than assume it.

## Changelog

- **v2** (2026-10-04) — Breaking: replaced the grouped
  `[{ "category", "files": [...] }]` shape with a flat array of records.
  Added `id`, `width`, `height`, `orientation`, `format`; `category` became a
  lowercase slug; `url`/`thumbnail` moved to jsDelivr.
- **v1** — Grouped by category with `{ name, url, thumbnail }` per file.
