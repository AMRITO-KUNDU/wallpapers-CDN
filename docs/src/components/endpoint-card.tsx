import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

type EndpointCardProps = {
  url: string;
  title: string;
  description: string;
  recommended?: boolean;
  className?: string;
};

export function EndpointCard({
  url,
  title,
  description,
  recommended = false,
  className,
}: EndpointCardProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await copyText(url);
      setCopied(true);
      toast.success("Endpoint copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-subtle uppercase">GET</span>
          <span className="truncate text-sm font-medium text-fg">{title}</span>
          {recommended ? (
            <Badge variant="accent" className="hidden sm:inline-flex">
              Recommended
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCopy}
          aria-label={`Copy ${title}`}
          className="shrink-0"
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="min-w-0 px-4 py-4">
        <p className="break-all font-mono text-xs leading-relaxed text-fg sm:text-sm">{url}</p>
        <p className="mt-3 text-sm text-muted">{description}</p>
      </div>
    </article>
  );
}
