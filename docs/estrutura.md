# Estrutura do repositório

Cada disciplina tem README, `disciplina.json`, aulas por data, projetos independentes, entregas com estado e referências. Slugs usam ASCII e hífens para simplificar caminhos e automações; nomes de exibição mantêm a grafia disponível.

O portfólio adota um monorepositório com escopos explícitos. Cada software mantém manifesto, lock e testes próprios. Não centralizar todas as dependências em um único ambiente. As duas versões SpeakUp permanecem irmãs para executar a comparação. A baseline original não é reformatada.

`catalogo/disciplinas.json` é o índice de navegação. `catalogo/importacao.json` relaciona arquivos versionados à origem e seus hashes antes/depois. `catalogo/adaptacoes.json` explica alterações nas cópias. O inventário integral e as duplicatas ficam em `acervo-local/`, fora do Git.

Templates são pontos de partida, não comprovação de conteúdo realizado. Arquivos .gitkeep preservam seções ainda vazias quando necessário. Projetos futuros podem ter testes e pipelines próprios.
