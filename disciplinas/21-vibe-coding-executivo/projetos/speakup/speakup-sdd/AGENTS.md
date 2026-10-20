# Instruções para agentes — SpeakUp SDD
Leia specs/requirements.md, specs/acceptance.md e specs/decisions.md antes de alterar comportamento.
Não assuma que o prompt interpretador é uma especificação completa do produto: ele produz diretrizes de kernel.
Toda mudança de regra deve citar requisito e cenário de aceite. Não invente política de créditos ou faturamento.
Preserve isolamento no banco. Demo não representa segurança multiusuário.
Execute npm test, npm run build, npm run test:e2e e npm run format:check. Registre falhas reais e testes não executados.
Não implante nem provisione contas automaticamente. Não inclua segredos em logs ou fixtures.
