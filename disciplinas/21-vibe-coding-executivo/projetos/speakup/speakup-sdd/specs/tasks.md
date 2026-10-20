# Plano de execução verificável
1. Preservar baseline e hashes das fontes; executar testes originais.
2. Registrar requisitos, critérios e decisões antes das alterações de comportamento.
3. Modularizar domínio e UI preservando reexports e contratos usados nos testes.
4. Corrigir ENG-01/02/03 e escrever regressões executadas também contra original.
5. Corrigir ENG-04 e verificar no navegador.
6. Corrigir ENG-05 por migração incremental e ampliar teste SQL.
7. Adicionar CI, instruções operacionais e comandos de validação.
8. Executar comparação, registrar evidências e limitações, produzir relatório lado a lado.
Estado de conclusão e comandos efetivamente executados: reports/validation.json e reports/*.log.
