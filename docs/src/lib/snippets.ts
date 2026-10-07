import { JSON_CDN_URL, REPO_SLUG } from "@/lib/constants";

export const JS_SNIPPET = `const INDEX =
  "${JSON_CDN_URL}";

const catalog = await fetch(INDEX).then((res) => res.json());

const nature = catalog.filter(
  (item) => item.category.toLowerCase() === "nature"
);

const wallpaper = nature[0];
// wallpaper.url is a direct CDN image
`;

export const FLUTTER_SNIPPET = `const indexUrl =
  '${JSON_CDN_URL}';

final response = await http.get(Uri.parse(indexUrl));
final catalog = jsonDecode(response.body) as List;

final wallpaper = catalog.firstWhere(
  (item) => item['category'] == 'nature',
  orElse: () => <String, dynamic>{},
);
`;

export const RN_SNIPPET = `const INDEX =
  "${JSON_CDN_URL}";

const catalog = await fetch(INDEX).then((res) => res.json());

const urls = catalog
  .filter((item) => item.category)
  .map((item) => item.url);
`;

export const SCHEMA_EXAMPLE = `[
  {
    "id": "nature-pexels-jack-redgate-333633-2929211",
    "name": "Pexels Jack Redgate 333633 2929211",
    "category": "nature",
    "url": "https://cdn.jsdelivr.net/gh/${REPO_SLUG}@main/wallpapers/nature/pexels-jack-redgate-333633-2929211.jpg",
    "thumbnail": "https://cdn.jsdelivr.net/gh/${REPO_SLUG}@main/thumbnails/nature/pexels-jack-redgate-333633-2929211.webp",
    "width": 2912,
    "height": 3640,
    "orientation": "portrait",
    "format": "jpeg"
  }
]`;
