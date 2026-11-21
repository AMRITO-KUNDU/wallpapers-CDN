import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Github, Menu, X } from "lucide-react";
import { APP_NAME, NAV, REPO_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-200 ease-out",
        scrolled || open ? "bg-bg/88 shadow-[var(--shadow-border)]" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-fg transition-opacity duration-150 hover:opacity-80"
        >
          <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-sm bg-accent">
            <span className="absolute inset-x-1.5 top-2 h-px bg-accent-fg/70" />
            <span className="absolute inset-x-2.5 bottom-2 h-px bg-accent-fg/50" />
            <span className="size-2 rounded-full bg-accent-fg" />
          </span>
          <span className="font-display text-xl tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-muted transition-colors duration-150 hover:text-fg",
                pathname === "/docs" && item.href === "/docs" && "text-fg",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              <Github />
              GitHub
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex h-11 items-center rounded-md px-3 text-sm text-fg hover:bg-surface-2"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-2 rounded-md px-3 text-sm text-fg hover:bg-surface-2"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
