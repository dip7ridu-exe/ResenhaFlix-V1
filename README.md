# ResenhaFlix

Site estático (GitHub Pages) para filmes, séries, animes e livros.

## v72 — fontes funcionando no navegador
- **FenixFlix e Zeus** entregam vídeos em links `http`/redirecionados que o navegador bloqueia em sites `https`. Com o **app Stremio aberto no computador**, o site usa o conversor do próprio Stremio (`127.0.0.1:11470/hlsv2`) e eles tocam (FenixFlix 🇧🇷 Dublado 1080p testado). Sem o Stremio aberto, essas opções aparecem como "Precisa do Stremio aberto" e o site usa as outras.
- **NoTorrent**: só aparecem opções em português e em 720p ou mais.
- Opções dubladas vêm primeiro; legendadas em PT depois.
- **FrostStream** agora exige conta. Crie a sua no site deles e cole o endereço pessoal em Configurações → Avançado → Fontes de vídeo: ele substitui o endereço público automaticamente.

## v71 — fontes do Stremio e carregamento rápido
- Fontes principais (nesta ordem): **FenixFlix, Zeus, NoTorrent e FrostStream**. BestCine fica como extra.
- O vídeo começa assim que fica pronto; as legendas chegam depois, sem travar o play (antes podia esperar 8 s ou mais).
- Filmes e séries ficam guardados no aparelho: da 2ª visita em diante as listas aparecem na hora e se atualizam sozinhas.
- Manifestos das fontes guardados por 24 h e carregados assim que o site abre.
- Compatível com os formatos dessas fontes: `description`, `headers`, `notWebReady`, links sem extensão (tenta HLS) e remoção dos links de doação/Discord/"Upgrade" do NoTorrent.

## v70 — versão mais leve
- Visual refeito com **Bootstrap 5.3** (CDN) + um único `resenhaflix.css`, no lugar de 7 folhas de estilo sobrepostas (~1.500 `!important`).
- Aba **Em alta** removida.
- Sem `backdrop-filter`/blur e com `content-visibility` nas fileiras: rolagem bem mais fluida no celular.
- Service worker guarda scripts versionados (`?v=70`): visitas seguintes abrem sem baixar tudo de novo.
- Ícones comprimidos (~730 KB → ~235 KB).

Para atualizar algo no futuro, troque o `?v=70` em `index.html` e `service-worker.js` por um número novo.
