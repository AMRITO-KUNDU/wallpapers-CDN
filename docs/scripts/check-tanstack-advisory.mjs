#!/usr/bin/env node
// Fails if the docs lockfile resolves a version of TanStack Start affected by
// CVE-2026-102989 (GHSA-qx66-fv34-fjm8) — critical reflected XSS in
// server-function responses, CVSS 9.3.
//
// Affected ranges:
//   @tanstack/react-start        >= 1.143.12  < 1.168.60
//   @tanstack/start-server-core  >= 1.143.12  < 1.169.39
//
// Bumping react-start alone is not enough: it pins start-server-core to an
// exact version, so the resolved copy of that package has to clear its own
// floor as well.
//
// Usage: node scripts/check-tanstack-advisory.mjs

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const lock = JSON.parse(readFileSync(join(here, "..", "package-lock.json"), "utf8"));

const FLOORS = {
  "@tanstack/react-start": "1.168.60",
  "@tanstack/start-server-core": "1.169.39",
};

const parse = v => String(v).split("-")[0].split(".").map(Number);

function gte(a, b) {
  const x = parse(a);
  const y = parse(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] > y[i]) return true;
    if (x[i] < y[i]) return false;
  }
  return true;
}

let failed = false;

for (const [name, floor] of Object.entries(FLOORS)) {
  const entry = lock.packages[`node_modules/${name}`];
  if (!entry) {
    console.error(`MISSING  ${name} — not present in the lockfile`);
    failed = true;
    continue;
  }
  const ok = gte(entry.version, floor);
  console.log(`${ok ? "ok  " : "FAIL"}     ${name} ${entry.version} (needs >= ${floor})`);
  if (!ok) failed = true;
}

if (failed) {
  console.error("\nLockfile is still affected by CVE-2026-102989. Refusing to pass.");
  process.exit(1);
}

console.log("\nCVE-2026-102989: lockfile resolves patched versions.");
