import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategorySample } from "@/lib/catalog";
import { SHOWCASE_CATEGORY_LIMIT } from "@/lib/catalog";
import { JSON_CDN_URL } from "@/lib/constants";

type CatalogSnapshotProps = {
  samples: CategorySample[];
  wallpaperCount: number;
  categoryCount: number;
  loading: boolean;
};

export function CatalogSnapshot({
  samples,
  wallpaperCount,
  categoryCount,
  loading,
}: CatalogSnapshotProps) {
  const visible = samples.slice(0, SHOWCASE_CATEGORY_LIMIT);
  const hidden = Math.max(0, samples.length - visible.length);

  return (
    <section id="index" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">The index</p>
          <h2 className="mt-2 font-display text-4xl tracking-tight text-fg sm:text-5xl">
            A sample from each category.
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            The JSON can list thousands of files. This page shows one wallpaper per folder so you
            can see how categories are grouped.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={JSON_CDN_URL} target="_blank" rel="noreferrer">
            Open images.json
            <ArrowUpRight />
          </a>
        </Button>
      </div>

      {loading ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="aspect-phone rounded-lg" />
          ))}
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((entry) => (
            <li key={entry.category}>
              <article className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
                <div className="aspect-phone overflow-hidden bg-surface-2">
                  <img
                    src={entry.sample.thumbnail}
                    alt=""
                    className="size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="px-3 py-3">
                  <p className="truncate text-sm font-medium text-fg">{entry.categoryLabel}</p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {entry.count} {entry.count === 1 ? "file" : "files"} in JSON
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Badge variant="muted">
          {categoryCount} {categoryCount === 1 ? "category" : "categories"}
        </Badge>
        <Badge variant="muted">
          {wallpaperCount} {wallpaperCount === 1 ? "file" : "files"} total
        </Badge>
        {hidden > 0 ? (
          <p className="text-sm text-muted">
            +{hidden} more {hidden === 1 ? "category" : "categories"} in the index
          </p>
        ) : (
          <p className="text-sm text-muted">File counts come from the live JSON, not this page.</p>
        )}
      </div>
    </section>
  );
}
