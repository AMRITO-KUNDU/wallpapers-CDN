#!/usr/bin/env node
// Validate that every Wikimedia Commons item in the import ledger has a
// matching WebP image, provenance sidecar, and generated catalog record.
const fs = require("fs");
const path = require("path");

const errors = [];
const ledger = JSON.parse(fs.readFileSync("imported.json", "utf8"));
const ledgerIds = Array.isArray(ledger.commons) ? ledger.commons.map(String) : [];
const expected = new Set(ledgerIds);
const sidecars = new Map();

if (expected.size !== ledgerIds.length) errors.push("imported.json contains duplicate Commons source IDs");

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".json") continue;
    let sidecar;
    try {
      sidecar = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      errors.push(`${filePath}: invalid JSON (${error.message})`);
      continue;
    }
    const credit = sidecar && sidecar.credit;
    if (!credit || credit.source !== "Wikimedia Commons") continue;

    const sourceId = sidecar.sourceId == null ? "" : String(sidecar.sourceId);
    const imagePath = path.join(path.dirname(filePath), `${path.parse(filePath).name}.webp`);
    if (!sourceId) errors.push(`${filePath}: missing sourceId`);
    if (!fs.existsSync(imagePath)) errors.push(`${filePath}: missing matching WebP image`);
    if (!credit.author || !credit.license || !credit.url || !credit.changes) {
      errors.push(`${filePath}: missing required creator/license/source/change attribution`);
    }
    if (!/^https:\/\/commons\.wikimedia\.org\//i.test(credit.url || "")) {
      errors.push(`${filePath}: source URL is not a Wikimedia Commons file page`);
    }

    const allowedLicense = /^(?:CC0(?:\s+1\.0)?|Public domain(?:\b|\s|[-(])|PD(?:\b|\s|[-(])|CC BY(?:-SA)?\s+(?:1\.0|2\.0|2\.5|3\.0|4\.0)(?:\s+[A-Z]{2})?)$/i;
    if (!allowedLicense.test(credit.license || "")) {
      errors.push(`${filePath}: unsupported imported license ${JSON.stringify(credit.license)}`);
    }
    if (/^CC(?:0| BY)/i.test(credit.license || "") && !/^https:\/\//i.test(credit.licenseUrl || "")) {
      errors.push(`${filePath}: missing license deed URL`);
    }
    if (sourceId) {
      if (sidecars.has(sourceId)) errors.push(`${filePath}: duplicate Commons sourceId ${sourceId}`);
      sidecars.set(sourceId, { filePath, credit, title: sidecar.title || "" });
      if (!expected.has(sourceId)) errors.push(`${filePath}: sourceId ${sourceId} is missing from imported.json`);
    }
  }
}

walk("wallpapers");
for (const sourceId of expected) {
  if (!sidecars.has(sourceId)) errors.push(`imported.json sourceId ${sourceId} has no matching credited image and sidecar`);
}

const catalog = JSON.parse(fs.readFileSync("images.json", "utf8"));
const commonsRecords = catalog.filter(item => item.credit && item.credit.source === "Wikimedia Commons");
if (commonsRecords.length !== expected.size) {
  errors.push(`images.json contains ${commonsRecords.length} Commons entries, but imported.json tracks ${expected.size}`);
}
const catalogUrls = new Set(commonsRecords.map(item => item.credit.url));
for (const [sourceId, item] of sidecars) {
  if (!catalogUrls.has(item.credit.url)) {
    errors.push(`${item.filePath}: sourceId ${sourceId} is missing from images.json`);
  }
}

if (errors.length) {
  console.error(`Commons import validation failed (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Commons import provenance OK — ${expected.size} credited assets match the ledger and catalog.`);
