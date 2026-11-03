import { ArrowRight, Copy } from "lucide-react";
import { EndpointCard } from "@/components/endpoint-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JSON_CDN_URL, JSON_GITHUB_URL } from "@/lib/constants";
import { copyText } from "@/lib/clipboard";
import { toast } from "sonner";

type HeroProps = {
  wallpaperCount: number;
  categoryCount: number;
};

export function Hero({ wallpaperCount, categoryCount }: HeroProps) {
  async function copyEndpoint() {
    try {
      await copyText(JSON_CDN_URL);
      toast.success("Endpoint copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <section className="relative isolate">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-28 pb-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:pt-32 lg:pb-16">
        <div>
          <div className="stagger-in">
            <Badge variant="muted">Open source · MIT · No API key</Badge>
          </div>
          <h1 className="stagger-in mt-6 font-display text-5xl leading-[1.05] tracking-tight text-fg sm:text-6xl lg:text-7xl">
            A wallpaper API
            <br />
            with <span className="italic">no backend.</span>
          </h1>
          <p className="stagger-in mt-5 max-w-md text-base text-muted sm:text-lg">
            Drop images into GitHub folders. A workflow publishes{" "}
            <span className="font-mono text-sm text-fg">images.json</span> to jsDelivr. Flutter,
            React Native, and the web fetch one file.
          </p>
          <div className="stagger-in mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" type="button" onClick={copyEndpoint}>
              <Copy />
              Copy endpoint
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/docs">
                Read the docs
                <ArrowRight />
              </a>
            </Button>
          </div>
          <dl className="stagger-in mt-10 grid max-w-md grid-cols-3 gap-4">
            <Stat label="In the index" value={wallpaperCount} />
            <Stat label="Categories" value={categoryCount} />
            <Stat label="Backend" value="None" />
          </dl>
        </div>

        <div id="endpoint" className="stagger-in flex scroll-mt-24 min-w-0 flex-col gap-3">
          <EndpointCard
            url={JSON_CDN_URL}
            title="images.json"
            description="Cached at the edge on jsDelivr. This is the URL your app should call."
            recommended
          />
          <EndpointCard
            url={JSON_GITHUB_URL}
            title="GitHub raw"
            description="Same JSON, served directly from the repository."
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-subtle uppercase">{label}</dt>
      <dd className="mt-1 font-display text-3xl tracking-tight text-fg tabular-nums">{value}</dd>
    </div>
  );
}
