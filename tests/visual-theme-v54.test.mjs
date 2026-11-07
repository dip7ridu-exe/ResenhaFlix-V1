import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

// v70: visual único em resenhaflix.css por cima do Bootstrap 5.3.
const root = new URL("../", import.meta.url);
const [app, html, css, manifest, worker] = await Promise.all([
  readFile(new URL("app.js", root), "utf8"),
  readFile(new URL("index.html", root), "utf8"),
  readFile(new URL("resenhaflix.css", root), "utf8"),
  readFile(new URL("manifest.webmanifest", root), "utf8"),
  readFile(new URL("service-worker.js", root), "utf8")
]);

assert.match(app, /function setSkipIntroEnabled/);

// Bootstrap carregado antes do tema do site, e tema escuro ativado.
const bootstrapIndex = html.indexOf("bootstrap@5.3.3/dist/css/bootstrap.min.css");
const themeIndex = html.indexOf("./resenhaflix.css?v=71");
assert.ok(bootstrapIndex >= 0 && themeIndex > bootstrapIndex, "resenhaflix.css deve carregar depois do Bootstrap");
assert.match(html, /<html lang="pt-BR" data-bs-theme="dark">/);

// Arquivos de CSS antigos não podem voltar a ser carregados.
for (const old of ["ui-polish.css", "theme-v54.css", "player-v55.css", "watch-party.css", "books-v62.css", "download-menu.css", "styles.css"]) {
  assert.ok(!html.includes(old), `${old} não deve ser carregado`);
  await assert.rejects(access(new URL(old, root)), `${old} deve ter sido removido`);
}

// Regras de desempenho do novo tema (comentários ignorados).
const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
assert.doesNotMatch(rules, /backdrop-filter/, "backdrop-filter pesa muito em celulares");
assert.doesNotMatch(rules, /filter:\s*blur/);
assert.ok((css.match(/!important/g) || []).length < 20, "o tema não deve depender de !important");
assert.match(css, /--rf-accent:#4b75ff/i);

assert.match(html, /id="rf-icon-play"/);
assert.match(html, /id="rf-icon-fullscreen"/);

const parsedManifest = JSON.parse(manifest);
assert.equal(parsedManifest.background_color, "#08070c");
assert.ok(parsedManifest.icons.every(icon => icon.src.endsWith("?v=70")), "PWA icons must bypass older caches");
assert.match(html, /\.\/icons\/resenhaflix-logo\.png\?v=70/);
assert.match(worker, /resenhaflix-shell-v71/);
assert.match(worker, /\.\/resenhaflix\.css\?v=71/);

const iconSizes = new Map([
  ["icons/icon-192.png", [192, 192]],
  ["icons/icon-512.png", [512, 512]],
  ["icons/icon-maskable-512.png", [512, 512]],
  ["icons/resenhaflix-logo.png", [192, 192]]
]);

for (const [path, [expectedWidth, expectedHeight]] of iconSizes) {
  const png = await readFile(new URL(path, root));
  assert.equal(png.subarray(1, 4).toString(), "PNG", `${path} must be a PNG`);
  assert.equal(png.readUInt32BE(16), expectedWidth, `${path} width`);
  assert.equal(png.readUInt32BE(20), expectedHeight, `${path} height`);
}

console.log("visual v70: Bootstrap + resenhaflix.css, sem CSS antigo, ícones OK");
