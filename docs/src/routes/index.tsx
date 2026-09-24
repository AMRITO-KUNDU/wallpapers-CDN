import { createFileRoute } from "@tanstack/react-router";
import { CatalogSnapshot } from "@/components/sections/catalog-snapshot";
import { Clients } from "@/components/sections/clients";
import { Endpoints } from "@/components/sections/endpoints";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useWallpapers } from "@/hooks/use-wallpapers";
import { FALLBACK_CATALOG } from "@/lib/catalog";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data, isPending } = useWallpapers();
  const catalog = data ?? FALLBACK_CATALOG;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main>
        <Hero wallpaperCount={catalog.wallpaperCount} categoryCount={catalog.categoryCount} />
        <Endpoints live={catalog.source === "live"} />
        <CatalogSnapshot
          samples={catalog.samples}
          wallpaperCount={catalog.wallpaperCount}
          categoryCount={catalog.categoryCount}
          loading={isPending && catalog.source !== "live"}
        />
        <HowItWorks />
        <Clients />
      </main>
      <SiteFooter />
    </div>
  );
}
