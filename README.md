# ResenhaFlix

Site estático (GitHub Pages) para filmes, séries, animes e livros.

## v70 — versão mais leve
- Visual refeito com **Bootstrap 5.3** (CDN) + um único `resenhaflix.css`, no lugar de 7 folhas de estilo sobrepostas (~1.500 `!important`).
- Aba **Em alta** removida.
- Sem `backdrop-filter`/blur e com `content-visibility` nas fileiras: rolagem bem mais fluida no celular.
- Service worker guarda scripts versionados (`?v=70`): visitas seguintes abrem sem baixar tudo de novo.
- Ícones comprimidos (~730 KB → ~235 KB).

Para atualizar algo no futuro, troque o `?v=70` em `index.html` e `service-worker.js` por um número novo.
