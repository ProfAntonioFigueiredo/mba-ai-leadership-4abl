# Biblioteca de leitura e consulta

[Abrir biblioteca HTML com busca](../biblioteca/index.html) · [Navegar em Markdown pelo GitHub](../biblioteca/README.md)

O índice reúne os documentos Markdown existentes e as conversões dos materiais do curso. A busca HTML consulta títulos e conteúdo completo, funciona sem servidor e permite filtrar por disciplina. No GitHub, use o índice Markdown: os arquivos `.md` são apresentados como páginas de leitura, com tabelas, imagens e links. Para consultar pelo navegador local, abra `biblioteca/index.html` ou o portal principal.

## Conteúdo e fidelidade

- DOCX: títulos, parágrafos, listas, tabelas e imagens incorporadas, via Pandoc.
- PDF: extração de texto por página; imagens e diagramas exigem o original. PDFs sem texto suficiente ficam pendentes de OCR.
- PPTX: texto, tabelas, imagens incorporadas e notas por slide; layouts, gráficos e SmartArt não são reproduzidos integralmente.
- XLSX: células e fórmulas por planilha, sem executar fórmulas ou reproduzir gráficos.
- Notebooks: células e saídas textuais gravadas, sem executar o código.
- Imagens: incorporadas em páginas Markdown para consulta visual, sem OCR.
- TXT e HTML: conteúdo textual; scripts das aplicações não são executados.
- Markdown: versões existentes são reutilizadas sempre que já importadas; nenhuma baseline de aplicação é alterada.

As conversões são transcrições, não resumos. Nenhum arquivo original é apagado. Entradas de conteúdo binário idêntico compartilham uma conversão; as origens ficam registradas em `catalogo/biblioteca.json`. Não se declara equivalência entre versões diferentes apenas pelo nome. O catálogo de pendências indica as fontes que ainda não puderam ser lidas ou convertidas; não confundir a importação anterior de binários com cobertura textual integral.

Materiais de aula e de terceiros permanecem atribuídos às fontes e aos respectivos titulares. O repositório continua privado. Imagens são extraídas apenas quando incorporadas nos formatos compatíveis; referências não resolvidas ficam registradas no catálogo e no texto original.

## Atualização

Instale Pandoc e Poppler, além das dependências Python listadas em `tools/requirements-library.txt`. Os passos abaixo são executados na raiz do repositório:

```sh
python3 tools/ingest_library.py --source /caminho/para/MBAAILEADERSHIP
python3 tools/build_portal.py
python3 tools/build_library.py
python3 tools/validate_library.py
python3 tools/validate_repo.py
```

O conversor não abre placeholders do OneDrive: mantenha as fontes no dispositivo e aguarde sua sincronização. Uma conversão existente continua disponível quando o original é posteriormente removido do armazenamento local pelo OneDrive. A ferramenta não publica automaticamente no GitHub nem expõe um site público. Confira as alterações antes de fazer commit e push.

O HTML é gerado para consulta local. No GitHub, arquivos HTML são exibidos como código; a leitura navegável usa os índices Markdown. Não foi ativado GitHub Pages nem alterada a visibilidade do repositório.
