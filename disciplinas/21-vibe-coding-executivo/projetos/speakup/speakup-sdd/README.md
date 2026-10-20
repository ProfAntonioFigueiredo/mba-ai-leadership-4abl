# SpeakUp SDD — importação pendente

A evolução SDD foi produzida e validada no trabalho anterior, mas sua pasta OneDrive está como placeholder e não pôde ser relida para esta organização. Não se afirma que seu código esteja nesta cópia.

O inventário registra os arquivos pendentes em `catalogo/pendencias-importacao.json`, na raiz do repositório. Reative a sincronização do OneDrive e execute `python3 tools/resume_import.py --source CAMINHO_DO_ACERVO` na raiz.

A baseline Vibe Coding foi recuperada de snapshot local da execução comparativa anterior. Seus arquivos foram copiados e verificados por SHA-256 no snapshot; a fonte OneDrive atual ainda precisa ser conferida.

O código SDD, sua documentação interativa e seus testes devem ser importados antes de executar o pipeline completo. Esta página documenta um bloqueio de leitura; não representa conclusão ou falha nova da aplicação.
