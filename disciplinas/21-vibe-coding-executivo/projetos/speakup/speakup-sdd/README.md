# SpeakUp — evolução com Spec-Driven Development

Comparação preparada em 19/10/2026 a partir do piloto `../speakup-lovable`. Original preservado. Método: fontes → requisitos → critérios de aceite → decisões → tarefas → código → testes → relatório. A skill específica mencionada não estava disponível; o usuário autorizou prosseguir com este fluxo explícito.

## Começar

```sh
npm ci
npm run dev
```

Acesse a URL local na porta 5174. Demo: matrícula `10045`, senha `Escola@@@`; dados fictícios no navegador, namespace separado do original. Os quatro perfis demo mantêm a experiência do piloto.

## Verificar

```sh
npm test
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
```

Critérios e limites: [specs/requirements.md](<specs/requirements.md>), [aceite](<specs/acceptance.md>), [decisões](<specs/decisions.md>), [tarefas](<specs/tasks.md>). Relatório lado a lado: [reports/comparacao.html](<reports/comparacao.html>) e [reports/relatorio-comparativo.md](<reports/relatorio-comparativo.md>). Logs e versões efetivamente testadas estão em reports/.

## Estrutura

- src/domain: importação, agenda e indicadores; domain.mjs mantém compatibilidade.
- src/application: mutação demo atômica, independente de persistência e interface.
- src/infrastructure: configuração e integração Supabase.
- src/features: telas de login e importação.
- src/ui: modal com navegação de teclado; App.jsx ainda concentra outras telas e estado.
- specs: requisitos, decisões, aceite e fontes extraídas.
- supabase/migrations: migração original preservada e correção incremental de ocupação por empresa.
- tests: domínio, regressões, configuração, SQL e navegador.
- .github/workflows/validate.yml: pipeline proposto para repositório cuja raiz seja esta pasta.

## Backend e limites

Leia [docs/operations.md](<docs/operations.md>). Nenhum banco remoto foi alterado. Configuração Supabase parcial gera erro visível; sem variáveis usa demo. Aplicar as duas migrações somente em ambiente de desenvolvimento revisado. Instruções de provisionamento herdadas: README_ORIGEM.md.

Esta entrega melhora o piloto; não implementa créditos, notificações reais, medição/faturamento, histórico CEFR, substituição ou SSO/ERP. Não certifica LGPD, SLA, desempenho sob carga ou produção. A senha compartilhada permanece uma pendência de negócio/segurança. Os testes SQL em PGlite não substituem Supabase Auth/Edge e concorrência em conexões reais.
