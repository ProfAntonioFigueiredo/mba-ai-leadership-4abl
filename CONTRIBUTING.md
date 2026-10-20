# Como manter o portfólio

1. Localize a disciplina no catálogo; confirme o nome oficial quando houver truncamento.
2. Para uma aula, crie `aulas/YYYY-MM-DD-tema/` e copie o modelo de aula.
3. Para um projeto, crie `projetos/nome-estavel/` com README, requisitos, instruções, testes e limitações. Use os manifestos adequados à stack.
4. Registre entregas como rascunho/revisado/submetido/confirmado, com evidência quando existir.
5. Mantenha materiais externos e registros pessoais no acervo local; não adicione .env ou dependências.
6. Atualize disciplina.json e o catálogo global. Com Pandoc instalado, rode `python3 tools/build_portal.py`. Depois rode `python3 tools/validate_repo.py` e os testes do projeto alterado.
7. Revise `git diff --cached` e só então faça commit/push. Não use force-push para reorganizações rotineiras.

Evite editar simultaneamente o projeto na pasta antiga e na organizada. Commits sugeridos: `docs(ai-core): ...`, `feat(vibe-coding): ...`, `chore(catalogo): ...`. O número da disciplina é organizacional e não precisa entrar no nome de cada commit.

Para mudanças SpeakUp orientadas pela skill específica, respeite a constituição e os checkpoints descritos nas specs. A importação para este monorepositório não encerra fases nem aprova produção.
