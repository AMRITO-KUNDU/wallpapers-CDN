# Wallpaper CDN

Docs site for a GitHub-powered wallpaper API. No backend, no keys, no setup.

## Scripts

```bash
npm install
npm run dev        # dev server
npm run build      # production build (Vercel output)
npm run preview    # serve the built output
npm run typecheck
npm run lint
```

## Structure

```
public/                  static assets
src/
  components/
    layout/              site header and footer
    sections/            home page sections
    ui/                  base UI primitives
  hooks/                 data hooks
  lib/                   catalog, constants, snippets, utilities
  routes/                file-based routes (/ and /docs)
  router.tsx
  styles.css
```
