# Execução e operação
Desenvolvimento: npm ci; npm run dev. Sem variáveis de backend, dados fictícios. Rode original na porta 5173 e SDD na porta 5174 para comparar. localStorage SDD usa chave própria.
Validação: npm test; npm run build; npm run test:e2e; npm run format:check. Instale Chromium com npx playwright install chromium antes de E2E.
Banco: aplicar migração original e depois 202610190001_rh_occupancy.sql somente em desenvolvimento. Não executar automaticamente em instância compartilhada. Backup e revisão antes de promoção.
Migração incremental substitui workspace_data; rollback restaura a definição da migração original, reintroduzindo a exposição de contagem de ocupação. Não fazer rollback de privacidade sem avaliar impacto.
Segredos: service role somente no backend/terminal; .env.local fora de versionamento. Origin não substitui autenticação ou limitação de tentativas.
Antes de produção: resolver senha compartilhada, rate limiting distribuído, paginação no servidor, telemetria sem PII, teste de carga representativo, restore de backup, retenção de auditoria e Auth/Edge reais. Não há evidência operacional de SLA ou certificação LGPD.
Observabilidade a implementar: identificador de requisição, latência por RPC, falhas por código e auditoria de ações. Nunca registrar senha, token ou planilhas completas.
