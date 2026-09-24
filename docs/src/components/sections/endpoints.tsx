import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/components/ui/badge";
import { SCHEMA_EXAMPLE } from "@/lib/snippets";

type EndpointsProps = {
  live: boolean;
};

const FIELDS = [
  { field: "category", description: "Folder name used as the category" },
  { field: "files", description: "Wallpapers in that folder" },
  { field: "name", description: "Original filename" },
  { field: "url", description: "Full-resolution image on jsDelivr" },
  { field: "thumbnail", description: "Optional WebP preview" },
];

export function Endpoints({ live }: EndpointsProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">Response</p>
          <h2 className="mt-2 font-display text-4xl tracking-tight text-fg sm:text-5xl">
            What the JSON contains.
          </h2>
        </div>
        <Badge variant={live ? "accent" : "muted"}>{live ? "Live index" : "Cached sample"}</Badge>
      </div>

      <div className="mt-8 grid min-w-0 items-start gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs tracking-wide text-subtle uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Field</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((row) => (
                <tr key={row.field} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs text-fg">{row.field}</td>
                  <td className="px-4 py-3 text-muted">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={SCHEMA_EXAMPLE} label="Example payload" wrap className="h-full" />
      </div>
    </section>
  );
}
