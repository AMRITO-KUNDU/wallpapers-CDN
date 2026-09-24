export const APP_NAME = "Wallpaper CDN";
export const APP_TAGLINE = "A GitHub-powered wallpaper API. No backend, no keys, no setup.";

export const REPO_URL = "https://github.com/AMRITO-KUNDU/wallpapers-CDN";
export const REPO_SLUG = "AMRITO-KUNDU/wallpapers-CDN";

export const JSON_CDN_URL =
  "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/images.json";
export const JSON_GITHUB_URL =
  "https://raw.githubusercontent.com/AMRITO-KUNDU/wallpapers-CDN/main/images.json";

export const WORKFLOW_URL = `${REPO_URL}/blob/main/.github/workflows/generate-image-json.yml`;

export const NAV = [
  { label: "Endpoint", href: "/#endpoint" },
  { label: "Index", href: "/#index" },
  { label: "Clients", href: "/#clients" },
  { label: "Docs", href: "/docs" },
] as const;
