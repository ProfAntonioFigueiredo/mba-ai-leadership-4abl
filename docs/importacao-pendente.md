# Importação parcial — bloqueio do OneDrive

Data de referência: 19/10/2026.

- 246 arquivos foram inventariados, excluindo dependências, builds e Git de terceiros.
- 2 arquivos foram copiados diretamente.
- 61 arquivos foram recuperados de snapshots locais existentes. O SHA-256 verifica essas cópias; não equivale a uma leitura atual da origem OneDrive.
- 183 arquivos continuam pendentes, inclusive fontes da versão SDD, documentos Word e referências de aula.

Foram solicitados downloads pelo Finder; o progresso permaneceu em 5% durante a execução. A tentativa de abrir o aplicativo OneDrive expirou. Nenhum original foi removido.

Para concluir, reative a sincronização, mantenha a pasta do MBA no dispositivo e use `python3 tools/resume_import.py --source CAMINHO_DO_ACERVO --apply --replace-placeholders`. O script não acessa contas externas e não substitui destinos editados sem indicar conflito. As pendências são explícitas no catálogo; o pipeline de aplicação permanece condicionado à presença dos fontes.
