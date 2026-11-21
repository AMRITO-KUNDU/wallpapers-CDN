import { Github } from "lucide-react";
import { APP_NAME, JSON_CDN_URL, REPO_URL } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-2xl tracking-tight">{APP_NAME}</p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              A GitHub-powered wallpaper API. Folders in, JSON out, images on jsDelivr.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-subtle uppercase">Product</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/#endpoint" className="text-muted hover:text-fg">
                  Endpoint
                </a>
              </li>
              <li>
                <a href="/docs" className="text-muted hover:text-fg">
                  Developer docs
                </a>
              </li>
              <li>
                <a
                  href={JSON_CDN_URL}
                  className="text-muted hover:text-fg"
                  target="_blank"
                  rel="noreferrer"
                >
                  images.json
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-subtle uppercase">Source</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={REPO_URL}
                  className="inline-flex items-center gap-2 text-muted hover:text-fg"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="size-3.5" />
                  GitHub repository
                </a>
              </li>
              <li>
                <a
                  href={`${REPO_URL}/blob/main/LICENSE`}
                  className="text-muted hover:text-fg"
                  target="_blank"
                  rel="noreferrer"
                >
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator />
        <p className="text-xs text-subtle">
          Images and the index are served from jsDelivr. This site is a developer showcase, not a
          wallpaper client.
        </p>
      </div>
    </footer>
  );
}
