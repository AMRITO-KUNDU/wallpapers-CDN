import { ArrowUpRight, Cloud, FileJson, FolderGit2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPO_URL, WORKFLOW_URL } from "@/lib/constants";

const STEPS = [
  {
    n: "01",
    title: "Add images",
    body: "Each folder under wallpapers/ is a category. JPG, PNG, and WebP are supported.",
  },
  {
    n: "02",
    title: "Push to GitHub",
    body: "An Action scans the folders and commits a fresh images.json. No manual editing.",
  },
  {
    n: "03",
    title: "GET the index",
    body: "Apps fetch one JSON file from jsDelivr and receive categories, filenames, and CDN URLs.",
  },
];

const TRAITS = [
  {
    icon: Unplug,
    title: "No backend",
    body: "GitHub is the database. jsDelivr is the CDN. You do not run a server.",
  },
  {
    icon: FileJson,
    title: "One JSON file",
    body: "Categories, names, full-resolution URLs, and optional WebP thumbnails.",
  },
  {
    icon: Cloud,
    title: "Edge cached",
    body: "jsDelivr serves the index and every image from a public CDN.",
  },
  {
    icon: FolderGit2,
    title: "Git as CMS",
    body: "Adding a wallpaper is a commit. Removing one is a commit.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">How it works</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-fg sm:text-5xl">
            Folders in. JSON out.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              Open the repository
              <ArrowUpRight />
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <a href={WORKFLOW_URL} target="_blank" rel="noreferrer">
              View the Action
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-xl bg-border md:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n} className="bg-surface px-6 py-8">
            <p className="font-mono text-xs text-subtle">{step.n}</p>
            <h3 className="mt-6 font-display text-2xl tracking-tight text-fg">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      <ul className="mt-4 grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
        {TRAITS.map((trait) => (
          <li key={trait.title} className="bg-surface px-5 py-5">
            <trait.icon className="size-4 text-muted" />
            <p className="mt-4 text-sm font-medium text-fg">{trait.title}</p>
            <p className="mt-1 text-sm text-muted">{trait.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
