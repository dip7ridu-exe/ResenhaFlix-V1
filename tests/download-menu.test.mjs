import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../download-menu.css", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../download-menu.js", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");

test("v63: menu de downloads para Windows e Android está integrado", () => {
  assert.match(html, /id="appDownloadMenu"/);
  assert.match(html, /aria-controls="appDownloadMenu"/);
  assert.match(html, /Navegar-na-Resenha-Windows-x64-v0\.1\.0\.zip/);
  assert.match(html, /Navegar-na-Resenha-Android-universal-v0\.1\.0\.apk/);
  assert.match(html, /download-menu\.css\?v=63/);
  assert.match(html, /download-menu\.js\?v=63/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(js, /event\.key === "Escape"/);
  assert.match(js, /trigger\.setAttribute\("aria-expanded", "true"\)/);
  assert.match(sw, /resenhaflix-shell-v63/);
  assert.match(sw, /download-menu\.css\?v=63/);
  assert.match(sw, /download-menu\.js\?v=63/);
});
