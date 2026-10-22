# MBA AI Leadership — 4ABL

## Para quem está chegando com a turma

Vamos usar o repositório inteiro para estudar e contribuir em todas as disciplinas. Você pode começar pelo navegador, sem saber programar.

**[Abrir o Guia da Turma em HTML — para colegas de turma e de trabalho](docs/guia-da-turma.html)** · [Ler o guia diretamente no GitHub](docs/guia-da-turma.md).

O HTML tem leitura adaptada ao celular, menu por etapas e opção de imprimir ou salvar em PDF. No GitHub, arquivos HTML são mostrados como código: para ler a página, abra o arquivo baixado no navegador ou use o endereço do portal quando estiver hospedado. Para leitura imediata dentro do GitHub, use a versão em texto.

O guia explica os nomes que aparecem no GitHub, ensina uma primeira contribuição e apresenta um roteiro para cada aula. Se o acesso estiver restrito, peça seu convite ao responsável pela turma.

Portfólio acadêmico e memória dos projetos de **Antonio Figueiredo**, turma **4ABL**. Repositório privado, organizado em 19/10/2026 para evoluir junto com as disciplinas.

## Comece aqui

- [Portal HTML responsivo](index.html): disciplinas, status e acesso aos projetos. Baixe/abra localmente; o GitHub não executa HTML na visualização de arquivo.
- [Catálogo de disciplinas](docs/disciplinas.md).
- [Estrutura e convenções](docs/estrutura.md).
- [Como adicionar aulas e projetos](CONTRIBUTING.md).
- [Origem, integridade e acervo local](docs/organizacao-local.md).
- [Direitos, privacidade e publicação](docs/direitos-e-privacidade.md).

## Estado da importação

**Concluída:** os 246 arquivos inventariados foram copiados e conferidos contra as fontes atuais. Nenhuma pendência de leitura; originais preservados. O acervo restrito continua fora do Git. Consulte [o registro da retomada](docs/importacao-pendente.md).

## Biblioteca de leitura

- [Ler e navegar no GitHub em Markdown](biblioteca/README.md).
- [Abrir biblioteca HTML com busca no conteúdo](biblioteca/index.html).
- [Formatos, cobertura e atualização](docs/biblioteca.md).

## Projetos em destaque

- [AI Core Concepts — Correlação CX](disciplinas/02-ai-core-concepts/projetos/correlacao-cx/README.md): notebooks, análise, scripts e gráficos.
- [Vibe Coding Executivo — SpeakUp](disciplinas/21-vibe-coding-executivo/projetos/speakup/README.md): original e evolução SDD lado a lado.
- [Documentação interativa SpeakUp](disciplinas/21-vibe-coding-executivo/projetos/speakup/speakup-sdd/docs/leitura.html).
- [Discovery SpeakUp](disciplinas/21-vibe-coding-executivo/projetos/discovery-speakup/README.md).
- [AI Sociedades do Futuro — entrega em elaboração](disciplinas/03-ai-sociedades-do-futuro/entregas/README.md).

## Organização

```text
catalogo/       disciplinas, importação e adaptações rastreáveis
 disciplinas/   21 áreas; aulas, projetos, entregas e referências
 docs/          organização, operação do repositório e decisões
 templates/     modelos para próximas disciplinas
 tools/         validação da estrutura e integridade
 .github/       CI e modelos de issue/PR
 acervo-local/  referências e originais; somente local, fora do Git
```

A numeração segue a imagem fornecida e não afirma ordem curricular. Três rótulos aparecem truncados e continuam pendentes de confirmação no portal. Disciplinas sem material não são apresentadas como concluídas.

## Validar organização

```sh
python3 tools/validate_repo.py
```

Os testes de software pertencem a cada projeto. O pipeline verifica a estrutura e executa a comparação e os testes SpeakUp com os fontes importados. não implanta projetos ou GitHub Pages. Nenhuma licença geral foi atribuída aos materiais de terceiros.
