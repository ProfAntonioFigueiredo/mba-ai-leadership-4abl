# Stack e restrições — SpeakUp

Data: 19/10/2026. Estado: constituição proposta para revisão humana.

## Base preservada

- Interface: React e React DOM, JavaScript/JSX, CSS, aplicação web responsiva.
- Desenvolvimento e build: Vite; diretório de saída `dist/`.
- Backend conectado: Supabase Auth, cliente Supabase JS, PostgreSQL e funções RPC; Edge Function de login do aluno em TypeScript/Deno.
- Importação: parser CSV local e `read-excel-file` para XLSX, carregado sob demanda.
- Demonstração: dados fictícios e persistência local com namespace próprio da versão SDD.

Não há decisão de migrar a aplicação inteira para TypeScript, trocar framework, criar microserviços ou escolher hospedagem. Essas expansões exigem especificação posterior.

## Runtime, dependências e reprodução

O manifesto atual exige Node >=22.12.0. A execução registrada utilizou Node 24.15.0; padronizar uma linha suportada para os ambientes futuros durante a especificação de ambiente.

A versão SDD utiliza npm e `package-lock.json`; instalar com `npm ci`. A origem usa pnpm, e seu lock foi preservado em `../reports/original-pnpm-lock.yaml`. As versões efetivamente instaladas constam em `../reports/dependencies.json`.

Os testes comparativos anteriores usaram as mesmas dependências instaladas para os dois códigos. Não reproduzem exatamente o lock pnpm original. Não alterar essa ressalva nem tratar uma atualização futura de dependências como parte invisível da comparação.

O HTML deve continuar em português brasileiro. Eventos de calendário são instantes com fuso explícito; datas civis usam YYYY-MM-DD; dinheiro usa tipo decimal exato no banco. Matrícula é identificador textual e deve preservar zeros iniciais. As 19 colunas oficiais permanecem regidas pelo PRD/PSS.

## Estrutura existente

```text
src/main.jsx                 entrada e inicialização
src/App.jsx                  estado e composição; ainda concentra algumas telas
src/domain/                  importação, agenda e indicadores
src/application/             caso de uso de mutação demo
src/infrastructure/          configuração e cliente Supabase
src/features/                login e importação
src/ui/                      modal compartilhado
supabase/migrations/         migração original e correção incremental
supabase/functions/          login do aluno
tests/                       domínio, configuração, SQL e navegador
docs/operations.md           instruções e pendências operacionais
reports/                     comparação, capturas, logs e hashes
specs/                       memória do projeto
```

Não se presume que essa organização já concluiu a modularização de App.jsx.

## Segurança e integração

- PostgreSQL mantém a autoridade de autorização/integridade; revisar grants, RLS e funções SECURITY DEFINER em conjunto.
- Manter `search_path` explícito e validação de papel e vínculo dentro das RPCs privilegiadas.
- Service role somente em backend/terminal autorizado; nunca em variáveis VITE, interface, fixtures ou logs.
- Nenhuma variável Supabase: demo. Configuração parcial: erro visível. Par configurado: inicializar backend antes da aplicação.
- A migração de 19/10 restringe a ocupação informada ao RH; não representa anonimização formal de todos os metadados.
- A senha compartilhada, rate limiting distribuído, recuperação de conta e ciclo de sessão exigem especificação e validação antes de produção.
- CORS não substitui autenticação; PGlite não substitui teste de Auth, Edge, rede ou sessões concorrentes reais.

## Verificação disponível

```sh
npm test
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
```

Há Node Test Runner, PGlite, Playwright/Chromium e Prettier. Prettier verifica formato, não tipos ou lint semântico. O workflow GitHub Actions está definido, mas não foi executado remotamente. A pasta de trabalho não era um repositório Git na inspeção anterior.

Esta etapa altera somente Markdown; usa os resultados anteriores como histórico, sem apresentá-los como uma nova execução. Não acrescenta runtime, dependências, scripts ou integrações à skill, que é Markdown-only.

## Restrições operacionais e lacunas

Backend de produção, região, domínios, política de segredos, notificações e calendário não estão provisionados por esta entrega. `workspace_data` ainda retorna coleções completas autorizadas; paginação é local. Atualização entre usuários, telemetria de serviço, carga, concorrência em múltiplas conexões, backup/restore e retenção externa permanecem sem comprovação.

Mudanças de contratos RPC devem incluir compatibilidade da interface, migração revisável e reversão planejada. Não executar migrações, provisionar usuários ou promover para produção por consequência automática da escrita de specs.

## Hierarquia de referência

1. Decisões explícitas do responsável e requisitos confirmados do produto.
2. Constituição revisada: mission.md, tech-stack.md e roadmap.md.
3. Specs futuras em `YYYY-MM-DD-feature-name/`, revisadas antes de implementação.
4. Artefatos anteriores requirements.md, acceptance.md, decisions.md e tasks.md: histórico técnico ainda útil; conflitos serão reconciliados em etapa posterior, sem reescrever a história dos testes.
