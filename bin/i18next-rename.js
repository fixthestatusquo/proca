#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

// --- Args ---
const argv = minimist(process.argv.slice(2), {
  boolean: ["dry-run"],
  alias: { d: "dry-run" },
  default: { "dry-run": false },
});

const [from, to] = argv._;
const dryRun = argv["dry-run"];

if (!from || !to) {
  console.error("Usage: node migrate-key.js <from> <to> [--dry-run]");
  console.error(
    'Example: node migrate-key.js "buttons.submit" "forms.buttons.submit" --dry-run'
  );
  process.exit(1);
}

if (dryRun) console.log("🔍 Dry run — no files will be written\n");

// --- Helpers ---
function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((acc, k) => acc?.[k], obj);
}

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split(".");
  const last = keys.pop();
  const target = keys.reduce((acc, k) => (acc[k] ??= {}), obj);
  target[last] = value;
}

function deleteNestedKey(obj, keyPath) {
  const keys = keyPath.split(".");
  const last = keys.pop();
  const parent = keys.reduce((acc, k) => acc?.[k], obj);
  if (parent) delete parent[last];
  // Clean up empty parent objects
  if (keys.length > 0) {
    const grandparent = keys.slice(0, -1).reduce((acc, k) => acc?.[k], obj);
    const parentKey = keys[keys.length - 1];
    if (grandparent && Object.keys(grandparent[parentKey] ?? {}).length === 0) {
      delete grandparent[parentKey];
    }
  }
}

// --- Main ---
const localesDir = path.resolve("./src/locales");

if (!fs.existsSync(localesDir)) {
  console.error(`Locales directory not found: ${localesDir}`);
  process.exit(1);
}

const langs = fs
  .readdirSync(localesDir)
  .filter(f => fs.statSync(path.join(localesDir, f)).isDirectory());

if (langs.length === 0) {
  console.error("No language directories found in src/locales/");
  process.exit(1);
}

let updatedCount = 0;

langs.forEach(lang => {
  const filePath = path.join(localesDir, lang, "common.json");

  if (!fs.existsSync(filePath)) {
    console.warn(`  ! Skipping ${lang}: common.json not found`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const value = getNestedValue(data, from);

  if (value === undefined) {
    console.warn(`  ! Skipping ${lang}: key "${from}" not found`);
    return;
  }

  setNestedValue(data, to, value);
  deleteNestedKey(data, from);

  if (!dryRun) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  }
  console.log(`  ${dryRun ? "~" : "✓"} ${lang}/common.json`);
  updatedCount++;
});

console.log(`\nDone. Updated ${updatedCount}/${langs.length} files.`);
console.log(`  "${from}" → "${to}"`);
