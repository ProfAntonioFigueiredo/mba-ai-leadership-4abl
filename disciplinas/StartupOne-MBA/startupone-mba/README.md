# EarlyDetect · Startup One MBA 2026.2

Repositório HTML local, sem dependências e utilizável offline. Abra `index.html` no navegador. Para compartilhar, envie o ZIP completo e peça que o colega o descompacte antes de abrir o HTML.

## Conteúdo
- `index.html`: síntese, requisitos oficiais, adaptação, cinco recortes de oportunidade, lacunas e plano do grupo.
- `fontes/`: 13 arquivos originais preservados, incluindo o guia.
- `documentos/index.html`: biblioteca pesquisável, com 13 documentos integrais em HTML responsivo.
- `documentos/assets/`: 43 páginas dos PDFs em imagem e 10 imagens dos documentos Word.
- `fontes-texto/`: extrações TXT para conferência e atalhos para os leitores HTML.
- `LEIA-ME.html`: instruções de download e navegação.
- `scripts/converter_html.py`: código de conversão para manutenção (não precisa ser executado para ler).
- `inventario.json`: origem, caminhos e SHA-256.
- `style.css`, `app.js`: apresentação responsiva e decisões locais exportáveis.
- `tema.css`: cores, tipografia e componentes compartilhados pelo portal e pela biblioteca.
- `assets/fonts/`: Ubuntu Regular, Bold e Italic locais, com a licença UFL 1.0, para manter a leitura offline.

Datas e requisitos foram extraídos exclusivamente do guia fornecido. Dados clínicos, legais e de mercado antigos não foram atualizados nem verificados externamente; são identificados como históricos ou pendentes. O acervo contém um projeto consolidado e cinco problemas de origem; quatro recortes alternativos são propostas de discussão.

A síntese segue os títulos e a ordem das páginas 16 e 17 do guia. O formato visual exato dependerá dos templates do Teams. Este HTML não substitui os dois PDFs e o vídeo exigidos na entrega final.

Decisões são armazenadas apenas no navegador local e podem ser exportadas em JSON; não existe sincronização multiusuário. Os originais incluem RM e relato familiar do autor. Compartilhe o pacote no âmbito do grupo, conforme pretendido, e revise o acervo antes de eventual publicação pública.

Gerado em 27/10/2026. Nenhum repositório remoto ou site público foi criado.

## Navegação HTML atualizada
Todos os links de citação apontam para os leitores HTML. Cada leitor oferece índice de tópicos quando disponível, navegação anterior/próximo, retorno à biblioteca e download opcional do original. Os PDFs têm texto responsivo por página e reprodução visual expansível. Os Canvas são apresentados em fluxo adaptável à tela. Imagens grandes podem ser abertas para ampliar.

O ZIP funciona sem servidor e sem conexão para o conteúdo local. Sites externos e o protótipo histórico dependem de internet e não foram certificados nesta conversão.

## Manutenção visual em 28/10/2026

Portal e biblioteca usam o padrão editorial didático da Aula 04 de Vibe Coding: fundo branco, texto roxo `#1F0A34`, destaque turquesa `#43BCCD`, cartões `#D7F1F4` e bordas `#BDD7DA`. Os links usam um turquesa mais escuro para leitura sobre fundos claros. As fontes Ubuntu ficam no pacote, sem consulta a serviços externos. A licença acompanha os arquivos; referência: https://canonical.com/legal/font-licence.

Altere cores e tipografia em `tema.css`. Mantenha regras exclusivas do portal em `style.css` e dos leitores em `documentos/leitura.css`. Os dois arquivos importam o mesmo tema. Ao compartilhar o ZIP, inclua também `tema.css` e `assets/`.

O conversor não recria nem sobrescreve `documentos/leitura.css`; ele exige que esse arquivo exista. Avisos e atalhos da biblioteca não são duplicados em novas conversões. O módulo pode ser importado sem gerar arquivos; a conversão só ocorre ao executar `scripts/converter_html.py` diretamente. A conversão requer Beautiful Soup, lxml e PyMuPDF; nenhuma dessas bibliotecas é necessária para ler o material no navegador.
