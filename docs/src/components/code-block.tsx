import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  label?: string;
  className?: string;
  wrap?: boolean;
};

export function CodeBlock({ code, label, className, wrap = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await copyText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-lg bg-surface-2 shadow-[var(--shadow-border)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span className="truncate text-xs tracking-wide text-subtle uppercase">
          {label ?? "Code"}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={onCopy} aria-label="Copy code">
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <pre
        className={cn(
          "p-4 font-mono text-xs leading-relaxed text-fg/90 sm:text-sm",
          wrap ? "whitespace-pre-wrap break-all" : "overflow-x-auto",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
