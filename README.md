# MBA AI Leadership — 4ABL

Portfólio acadêmico e memória dos projetos de **Antonio Figueiredo**, turma **4ABL**. Repositório privado, organizado em 19/10/2026 para evoluir junto com as disciplinas.

## Comece aqui

- [Portal HTML responsivo](index.html): disciplinas, status e acesso aos projetos. Baixe/abra localmente; o GitHub não executa HTML na visualização de arquivo.
- [Catálogo de disciplinas](docs/disciplinas.md).
- [Estrutura e convenções](docs/estrutura.md).
- [Como adicionar aulas e projetos](CONTRIBUTING.md).
- [Origem, integridade e acervo local](docs/organizacao-local.md).
- [Direitos, privacidade e publicação](docs/direitos-e-privacidade.md).

## Estado da importação

O OneDrive bloqueou a leitura de parte do acervo. Foram recuperados snapshots locais de AI Core Concepts e do SpeakUp original. O código SDD e outros documentos permanecem pendentes; consulte [o registro de importação](docs/importacao-pendente.md). Arquivos pendentes não são tratados como copiados.

## Projetos em destaque

- [AI Core Concepts — Correlação CX](disciplinas/02-ai-core-concepts/projetos/correlacao-cx/README.md): notebooks, análise, scripts e gráficos.
- [Vibe Coding Executivo — SpeakUp](disciplinas/21-vibe-coding-executivo/projetos/speakup/README.md): original e evolução SDD lado a lado.
- [Estado da importação SDD](disciplinas/21-vibe-coding-executivo/projetos/speakup/speakup-sdd/README.md).
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

Os testes de software pertencem a cada projeto. O pipeline executa a verificação de estrutura; os testes SpeakUp SDD ficam condicionados à importação de seus fontes e lock. não implanta projetos ou GitHub Pages. Nenhuma licença geral foi atribuída aos materiais de terceiros.
