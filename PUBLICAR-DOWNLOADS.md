# Publicar os downloads do Navegar na Resenha

O ResenhaFlix já aponta os dois botões de download para uma Release do GitHub. Os instaladores não devem ser colocados diretamente dentro do repositório: o pacote do Windows ultrapassa o limite de 100 MB para arquivos comuns do GitHub.

## Passos

1. No repositório `dip7ridu-exe/ResenhaFlix-V1`, abra **Releases** e clique em **Draft a new release**.
2. Em **Choose a tag**, crie exatamente a tag `navegar-na-resenha-v0.1.0`.
3. Use o título `Navegar na Resenha v0.1.0`.
4. Anexe estes dois arquivos, mantendo exatamente os nomes abaixo:
   - `Navegar-na-Resenha-Windows-x64-v0.1.0.zip`
   - `Navegar-na-Resenha-Android-universal-v0.1.0.apk`
5. Clique em **Publish release**.

Depois de publicar a Release, os dois botões abertos pelo mascote do ResenhaFlix começam a baixar os arquivos diretamente. Nenhum instalador entra no carregamento normal do site.
