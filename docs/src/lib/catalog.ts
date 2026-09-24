import { JSON_CDN_URL, JSON_GITHUB_URL } from "@/lib/constants";

export type WallpaperFile = {
  name: string;
  url: string;
  thumbnail?: string;
};

export type CategoryGroup = {
  category: string;
  files: WallpaperFile[];
};

export type Wallpaper = {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  displayName: string;
  url: string;
  thumbnail: string;
};

export type CategorySample = {
  category: string;
  categoryLabel: string;
  count: number;
  sample: Wallpaper;
};

export type Catalog = {
  groups: CategoryGroup[];
  samples: CategorySample[];
  wallpaperCount: number;
  categoryCount: number;
  source: "live" | "fallback";
};

/** Branding page never renders more than this many category tiles. */
export const SHOWCASE_CATEGORY_LIMIT = 8;

const FALLBACK: CategoryGroup[] = [
  {
    category: "Anime",
    files: [
      {
        name: "gojo_satoru.jpg",
        url: "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/Anime/gojo_satoru.jpg",
        thumbnail:
          "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/Anime/gojo_satoru.webp",
      },
    ],
  },
  {
    category: "Quotes",
    files: [
      {
        name: "images.jpg",
        url: "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/Quotes/images.jpg",
        thumbnail:
          "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/Quotes/images.webp",
      },
    ],
  },
  {
    category: "Space",
    files: [
      {
        name: "images.jpg",
        url: "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/Space/images.jpg",
        thumbnail:
          "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/Space/images.webp",
      },
      {
        name: "scenic-view-rocky-mountain-evening.jpg",
        url: "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/Space/scenic-view-rocky-mountain-evening.jpg",
        thumbnail:
          "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/Space/scenic-view-rocky-mountain-evening.webp",
      },
    ],
  },
  {
    category: "abstract",
    files: [
      {
        name: "Professional Iphone Wallpaper.jpg",
        url: "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/abstract/Professional Iphone Wallpaper.jpg",
        thumbnail:
          "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/abstract/Professional Iphone Wallpaper.webp",
      },
    ],
  },
  {
    category: "nature",
    files: [
      {
        name: "pexels-jack-redgate-333633-2929211.jpg",
        url: "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/nature/pexels-jack-redgate-333633-2929211.jpg",
        thumbnail:
          "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/nature/pexels-jack-redgate-333633-2929211.webp",
      },
      {
        name: "pexels-todd-trapani-488382-2754200.jpg",
        url: "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/wallpapers/nature/pexels-todd-trapani-488382-2754200.jpg",
        thumbnail:
          "https://cdn.jsdelivr.net/gh/AMRITO-KUNDU/wallpapers-CDN@main/thumbnails/nature/pexels-todd-trapani-488382-2754200.webp",
      },
    ],
  },
];

export function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^iphone$/i.test(word)) return "iPhone";
      if (/^ios$/i.test(word)) return "iOS";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function categoryLabel(category: string): string {
  return titleCase(category);
}

export function prettyName(name: string, category: string, index: number): string {
  const base = name.replace(/\.[^.]+$/, "");
  if (/^images$/i.test(base)) {
    return `${categoryLabel(category)} ${index + 1}`;
  }
  if (/^pexels-/i.test(base)) {
    const parts = base.split("-").slice(1);
    const photographer = parts.filter((part) => !/^\d+$/.test(part)).join(" ");
    return photographer ? titleCase(photographer) : `${categoryLabel(category)} ${index + 1}`;
  }
  return titleCase(base);
}

export function safeUrl(url: string): string {
  try {
    return encodeURI(url);
  } catch {
    return url;
  }
}

function toWallpaper(group: CategoryGroup, file: WallpaperFile, index: number): Wallpaper {
  return {
    id: `${group.category}/${file.name}`,
    category: group.category,
    categoryLabel: categoryLabel(group.category),
    name: file.name,
    displayName: prettyName(file.name, group.category, index),
    url: safeUrl(file.url),
    thumbnail: safeUrl(file.thumbnail ?? file.url),
  };
}

export function categorySamples(groups: CategoryGroup[]): CategorySample[] {
  const samples: CategorySample[] = [];
  for (const group of groups) {
    const file = group.files[0];
    if (!file) continue;
    samples.push({
      category: group.category,
      categoryLabel: categoryLabel(group.category),
      count: group.files.length,
      sample: toWallpaper(group, file, 0),
    });
  }
  return samples;
}

function parseGroups(data: unknown): CategoryGroup[] {
  if (!Array.isArray(data)) return [];
  const groups: CategoryGroup[] = [];
  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.category !== "string" || !Array.isArray(record.files)) continue;
    const files: WallpaperFile[] = [];
    for (const file of record.files) {
      if (!file || typeof file !== "object") continue;
      const item = file as Record<string, unknown>;
      if (typeof item.name !== "string" || typeof item.url !== "string") continue;
      files.push({
        name: item.name,
        url: item.url,
        thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : undefined,
      });
    }
    if (files.length) groups.push({ category: record.category, files });
  }
  return groups;
}

function toCatalog(groups: CategoryGroup[], source: Catalog["source"]): Catalog {
  return {
    groups,
    samples: categorySamples(groups),
    wallpaperCount: groups.reduce((sum, group) => sum + group.files.length, 0),
    categoryCount: groups.length,
    source,
  };
}

async function fetchJson(url: string): Promise<CategoryGroup[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load catalog (${response.status})`);
  }
  return parseGroups(await response.json());
}

export const FALLBACK_CATALOG: Catalog = toCatalog(FALLBACK, "fallback");

export async function fetchCatalog(): Promise<Catalog> {
  try {
    const groups = await fetchJson(JSON_CDN_URL);
    if (groups.length) return toCatalog(groups, "live");
  } catch {
    try {
      const groups = await fetchJson(JSON_GITHUB_URL);
      if (groups.length) return toCatalog(groups, "live");
    } catch {
      // fall through
    }
  }
  return toCatalog(FALLBACK, "fallback");
}
