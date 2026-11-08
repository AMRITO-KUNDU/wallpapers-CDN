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
| `tags`        | string[]          | Lowercase search tags. **Always includes `category`.** More come from a sidecar or `tags.json`. |
| `credit`      | object \| absent  | Optional provenance: `{ author, license, source, url, licenseUrl, changes }`. Present on imported images. |

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
7. `tags` is a non-empty array of unique, lowercase, comma-free strings, and it
   always contains the record's own `category`.
8. `tags-index.json` exists and its per-tag counts match `images.json` exactly.

## Tags

Every record carries a `tags` array so clients can offer search and filtering
without a second request. Two things feed it:

1. **The category**, added automatically. A wallpaper in `wallpapers/Anime/`
   always has `"anime"` in its tags, so a record is never untagged.
2. **`tags.json` at the repo root**, hand-edited, keyed by wallpaper `id`:

```json
{
  "anime-gojo-satoru": "gojo, jujutsu kaisen, blue, dark",
  "nature-pexels-jack-redgate-333633-2929211": "forest, mist, green, desktop"
}
```

Write the value as a **comma-separated string** (an array works too). The
generator trims each entry, drops a leading `#`, lowercases it, collapses
whitespace, removes duplicates, and appends the result to the category tag. So
`"Gojo, #blue,  blue "` becomes `["gojo", "blue"]`, and the record ends up with
`["anime", "gojo", "blue"]`.

Tags are free-form — there is no controlled vocabulary yet. Two conventions
worth keeping: reuse existing tags where you can (check `tags-index.json`
before inventing one), and use spaces rather than hyphens for multi-word tags
(`"jujutsu kaisen"`, not `"jujutsu-kaisen"`).

Because `tags.json` is keyed by `id`, and `id` is derived from the folder and
file name, **renaming a wallpaper file orphans its tags**. The generator prints
a warning listing any `tags.json` key that matches no wallpaper; treat that
warning as a rename you need to fix.

### `tags-index.json`

The generator also emits `tags-index.json`, a tag → count index built from the
same run:

```json
{
  "generated_from": "images.json",
  "wallpaper_count": 7,
  "tag_count": 3,
  "tags": [
    { "tag": "nature", "count": 2, "categories": ["nature"] },
    { "tag": "anime", "count": 1, "categories": ["anime"] }
  ]
}
```

Sorted by `count` descending, then alphabetically — so the most useful filter
chips come first. Clients can render a filter bar from this file alone, without
downloading every record. It is a cache-friendly companion, not a source of
truth: `images.json` remains authoritative, and CI fails if the two disagree.

## Per-image sidecars

A JSON file sitting next to an image, with the same base name, supplies extra
metadata for that one wallpaper:

```text
wallpapers/Space/trifid-nebula-pia04220.webp
wallpapers/Space/trifid-nebula-pia04220.json   <- sidecar
```

```json
{
  "title": "Trifid Nebula",
  "tags": "space, nebula, trifid",
  "credit": {
    "author": "JPL (NASA)",
    "license": "Public domain",
    "source": "NASA Image and Video Library",
    "url": "https://images.nasa.gov/details/PIA04220"
  }
}
```

All three keys are optional. `title` overrides the display `name` that would
otherwise be derived from the file name, `tags` is merged after the category tag
(exactly like `tags.json`), and `credit` is copied through as-is.

This is how `scripts/import-wallpapers.js` records where a bulk-imported image
came from. Deleting the image deletes its sidecar with it, so provenance can
never outlive the file it describes.

## Automated imports

`scripts/import-wallpapers.js` searches Wikimedia Commons and accepts only files
whose machine-readable license is CC0, public domain, CC BY, or CC BY-SA. It
rejects unknown, non-commercial, and no-derivatives licenses; requires portrait
images at least 1600 × 900; and records the creator, file page, license deed,
and conversion note in the image sidecar and generated index. Files are
converted to WebP and resized without cropping. A deduplication ledger in
`imported.json` prevents repeat imports, and a daily GitHub Action adds at most
50 files per run until the 2,000-import target is reached. Manual runs can add
up to 100 at a time.

Each photograph keeps its own license; the repository's MIT license does not
replace or override those per-image terms. Wikimedia Commons says reuse still
requires following each file's license and checking for non-copyright limits
such as privacy or personality rights ([Commons licensing](https://commons.wikimedia.org/wiki/Commons:Licensing),
[reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia)).
The importer preserves attribution metadata but cannot independently verify
every rights claim. Pexels, Unsplash, and Pixabay are not used because their
catalog terms do not permit compiling their libraries into a competing
wallpaper service.

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

- **v2, additive** (2026-10-31) — optional `credit.licenseUrl` and
  `credit.changes` fields preserve the license deed and any conversion notes
  for imported media. Existing clients may ignore them.

- **v2, additive** (2026-10-30) — optional `credit` object on records, plus
  per-image sidecar support (`<image>.json`) for `title`, `tags` and `credit`.
  Again additive only.

- **v2, additive** (2026-10-30) — every record gained `tags` (a non-empty
  array that always contains `category`), and the build now also emits
  `tags-index.json`. Purely additive: the top-level shape and every existing
  field are unchanged, so clients that ignore unknown fields need no changes.
  Tag authoring lives in `tags.json`.
- **v2** (2026-10-04) — Breaking: replaced the grouped
  `[{ "category", "files": [...] }]` shape with a flat array of records.
  Added `id`, `width`, `height`, `orientation`, `format`; `category` became a
  lowercase slug; `url`/`thumbnail` moved to jsDelivr.
- **v1** — Grouped by category with `{ name, url, thumbnail }` per file.
