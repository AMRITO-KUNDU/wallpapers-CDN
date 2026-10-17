#!/usr/bin/env node
// Validates images.json against the documented schema (see SCHEMA.md).
//
// This runs in CI *before* the generated index is committed. If a change to
// the generator (or to a wallpaper file) would violate the published
// contract, this fails loudly instead of silently shipping a breaking change
// to every client that reads the index.
//
// Exits 0 when valid, 1 when the contract is violated.

const fs = require("fs");

const INDEX_PATH = "images.json";

// Required on every wallpaper record. See SCHEMA.md.
const REQUIRED_STRING_FIELDS = ["id", "name", "category", "url", "thumbnail", "format"];
const REQUIRED_NUMBER_FIELDS = ["width", "height"];

function fail(message) {
  console.error(`\u2716 images.json contract violation: ${message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
} catch (error) {
  fail(`not valid JSON (${error.message})`);
}

if (!Array.isArray(data)) {
  fail(`top level must be a flat array, got ${Array.isArray(data) ? "array" : typeof data}`);
}

if (data.length === 0) {
  fail("index is empty");
}

const seenIds = new Set();

data.forEach((item, index) => {
  if (item === null || typeof item !== "object" || Array.isArray(item)) {
    fail(`item ${index} must be an object`);
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof item[field] !== "string" || item[field].length === 0) {
      fail(`item ${index} is missing required string field "${field}"`);
    }
  }

  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (item[field] !== null && typeof item[field] !== "number") {
      fail(`item ${index} field "${field}" must be a number or null`);
    }
  }

  for (const field of ["url", "thumbnail"]) {
    const value = item[field];
    if (!/^https?:\/\//.test(value)) {
      fail(`item ${index} field "${field}" must be an absolute http(s) URL`);
    }
    // The URL must be safe to request as-is: no raw spaces or other
    // non-ASCII / control characters that would need client-side encoding.
    if (/[^\x21-\x7e]/.test(value)) {
      fail(`item ${index} field "${field}" contains unencoded characters: ${value}`);
    }
  }

  if (seenIds.has(item.id)) {
    fail(`duplicate id "${item.id}"`);
  }
  seenIds.add(item.id);
});

console.log(
  `\u2714 images.json OK \u2014 ${data.length} wallpapers, ${seenIds.size} unique ids, schema v2`
);
