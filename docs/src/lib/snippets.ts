import { JSON_CDN_URL, REPO_SLUG } from "@/lib/constants";

export const JS_SNIPPET = `const INDEX =
  "${JSON_CDN_URL}";

const catalog = await fetch(INDEX).then((res) => res.json());

const nature = catalog.find(
  (group) => group.category.toLowerCase() === "nature"
);

const wallpaper = nature.files[0];
// wallpaper.url is a direct CDN image
`;

export const FLUTTER_SNIPPET = `const indexUrl =
  '${JSON_CDN_URL}';

final response = await http.get(Uri.parse(indexUrl));
final catalog = jsonDecode(response.body) as List;

final group = catalog.first as Map<String, dynamic>;
final files = group['files'] as List;
`;

export const RN_SNIPPET = `const INDEX =
  "${JSON_CDN_URL}";

const catalog = await fetch(INDEX).then((res) => res.json());

const urls = catalog.flatMap((group) =>
  group.files.map((file) => file.url)
);
`;

export const SCHEMA_EXAMPLE = `[
  {
    "category": "Nature",
    "files": [
      {
        "name": "nature-mountain-lake.jpg",
        "url": "https://cdn.jsdelivr.net/gh/${REPO_SLUG}@main/wallpapers/Nature/nature-mountain-lake.jpg",
        "thumbnail": "https://cdn.jsdelivr.net/gh/${REPO_SLUG}@main/thumbnails/Nature/nature-mountain-lake.webp"
      }
    ]
  }
]`;
