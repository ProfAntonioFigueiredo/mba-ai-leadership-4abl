# Decisões e pendências

## ADR-001 — Evolução comparável
Manter React/Vite, PostgreSQL/Supabase, UI e API do piloto. Reorganizar responsabilidades e corrigir regressões especificadas. Reescrever todo o produto impediria comparar o mesmo escopo e acrescentaria risco sem evidência.

## ADR-002 — Segurança no servidor
Manter funções SECURITY DEFINER com search_path vazio e autorização explícita; RLS e grants continuam presentes. Corrigir apenas a contagem de ocupação do RH que agregava outras empresas. Unidade do demo não é vínculo corporativo de produção.

## ADR-003 — Demonstração e configuração
Sem URL/chave: demo com namespace localStorage próprio. Um valor isolado: erro de configuração renderizado. Duas variáveis: Supabase. Não carregar demo em configuração parcial.

## ADR-004 — Datas e limites
Eventos são instantes ISO com fuso explícito; comparar epoch em JavaScript. Intervalos adjacentes são permitidos. Capacity 1–100 e lote 1–5.000 repetem limites já presentes no servidor. Não criar política financeira.

## ADR-005 — Modal
Usar elemento dialog nativo e showModal para contenção de foco e fundo inerte; Escape e restauração explícita de foco. Verificar no navegador real. Não alegar conformidade WCAG completa.

## ADR-006 — Dependências e reprodutibilidade
A versão SDD usa npm/package-lock.json, pois pnpm não estava instalado e sua resolução inicial foi bloqueada pela rede. O lock original foi preservado em reports/original-pnpm-lock.yaml. A baseline isolada usa as mesmas dependências instaladas da cópia SDD por link local, sem mudar as declarações do original. Registre versões resolvidas em reports/dependencies.json. Essa normalização limita inferências sobre builds feitos em outros ambientes.

## Decisões de negócio pendentes
DEC-01: senha fixa versus senha inicial. Material contraditório. Mantida regra existente para comparabilidade; resolver antes de produção com responsável.
DEC-02: cancelamento/expiração/créditos. Exige dono do produto.
DEC-03: preços, competência e aprovação financeira. Exige contratos.
DEC-04: segregação por cliente além do RH: original tem coordenação global; não assumir escola multi-tenant sem requisito.
DEC-05: retenção/anonimização e controles jurídicos/operacionais. Requer responsáveis competentes.

## Referências técnicas primárias consultadas
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/functions
- https://www.postgresql.org/docs/17/explicit-locking.html
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
Essas fontes orientam revisão técnica; não provam que a implementação atende os requisitos.

## ADR-007 — Carregamento sob demanda
O parser XLSX é carregado somente ao importar Excel; o cliente Supabase é inicializado antes da renderização e carregado apenas quando configurado. Medir artefatos de build, sem confundir tamanho de bundle com latência real ou RNF-02.
