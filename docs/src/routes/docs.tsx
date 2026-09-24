import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { EndpointCard } from "@/components/endpoint-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { JSON_CDN_URL, JSON_GITHUB_URL, REPO_URL, WORKFLOW_URL } from "@/lib/constants";
import { FLUTTER_SNIPPET, JS_SNIPPET, RN_SNIPPET, SCHEMA_EXAMPLE } from "@/lib/snippets";

export const Route = createFileRoute("/docs")({ component: DocsPage });

function DocsPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6">
        <Badge variant="muted">Reference</Badge>
        <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">Developer docs</h1>
        <p className="mt-4 text-lg text-muted">
          Wallpaper CDN is a GitHub repository that publishes a JSON index of categorized
          wallpapers. There is no API key, no rate-limited backend, and nothing to provision.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={JSON_CDN_URL} target="_blank" rel="noreferrer">
              Open images.json
              <ArrowUpRight />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              View source
            </a>
          </Button>
        </div>

        <Separator className="my-12" />

        <DocSection id="endpoints" title="Endpoints">
          <p className="text-muted">
            Prefer jsDelivr. It is cached at the edge and typically faster than raw GitHub. Both
            URLs return the same JSON.
          </p>
          <div className="mt-5 flex min-w-0 flex-col gap-3">
            <EndpointCard
              url={JSON_CDN_URL}
              title="images.json"
              description="Cached at the edge. Use this in production apps."
              recommended
            />
            <EndpointCard
              url={JSON_GITHUB_URL}
              title="GitHub raw"
              description="Direct from the repository. Useful as a fallback."
            />
          </div>
        </DocSection>

        <DocSection id="schema" title="JSON shape">
          <p className="text-muted">
            The index is an array of category objects. Each file includes a direct CDN URL and, when
            available, a WebP thumbnail.
          </p>
          <div className="mt-5 min-w-0 overflow-x-auto rounded-lg shadow-[var(--shadow-border)]">
            <table className="w-full min-w-96 text-left text-sm">
              <thead className="bg-surface-2 text-xs tracking-wide text-subtle uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Field</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="bg-surface">
                <Row field="category" description="Folder name used as the category" />
                <Row field="files" description="Wallpapers in that folder" />
                <Row field="name" description="Original filename" />
                <Row field="url" description="Full-resolution image on jsDelivr" />
                <Row field="thumbnail" description="Optional WebP preview" />
              </tbody>
            </table>
          </div>
          <CodeBlock code={SCHEMA_EXAMPLE} label="Example" className="mt-5" wrap />
        </DocSection>

        <DocSection id="clients" title="Clients">
          <p className="text-muted">
            Fetch the JSON, then render <span className="font-mono text-fg">url</span> as the
            wallpaper and <span className="font-mono text-fg">thumbnail</span> in grids.
          </p>
          <CodeBlock code={JS_SNIPPET} label="JavaScript / Web" className="mt-5" />
          <CodeBlock code={FLUTTER_SNIPPET} label="Flutter" className="mt-3" />
          <CodeBlock code={RN_SNIPPET} label="React Native" className="mt-3" />
        </DocSection>

        <DocSection id="contribute" title="Adding wallpapers">
          <ol className="list-decimal space-y-3 pl-5 text-muted">
            <li>
              Create a folder under <span className="font-mono text-fg">wallpapers/</span>, or use
              an existing one.
            </li>
            <li>Drop JPG, JPEG, PNG, or WebP files into it.</li>
            <li>
              Commit and push. The Action rewrites{" "}
              <span className="font-mono text-fg">images.json</span>.
            </li>
          </ol>
          <p className="mt-4 text-muted">
            No manual editing of the index is required. Apps that already fetch the JSON pick up new
            files automatically.
          </p>
          <Button variant="outline" className="mt-5" asChild>
            <a href={WORKFLOW_URL} target="_blank" rel="noreferrer">
              View the GitHub Action
              <ArrowUpRight />
            </a>
          </Button>
        </DocSection>

        <DocSection id="formats" title="Supported formats">
          <ul className="space-y-2 text-muted">
            <li>JPG / JPEG</li>
            <li>PNG</li>
            <li>WebP</li>
          </ul>
        </DocSection>
      </main>
      <SiteFooter />
    </div>
  );
}

function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mt-14">
      <h2 className="font-display text-3xl tracking-tight">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ field, description }: { field: string; description: string }) {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 font-mono text-xs text-fg">{field}</td>
      <td className="px-4 py-3 text-muted">{description}</td>
    </tr>
  );
}
