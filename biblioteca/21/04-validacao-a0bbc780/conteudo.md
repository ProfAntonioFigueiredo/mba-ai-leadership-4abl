# 04_VALIDACAO

[Índice da biblioteca](../../README.md)

> Fonte: `Vibe Coding Executivo/speakup-lovable/04_VALIDACAO.txt`  
> SHA-256: `a0bbc7803e44e0cb792e9446ea376a482402ead8a01890328c22a3e5c54e548d`  
> Transcrição textual integral; não é resumo.  
> Material do acervo acadêmico fornecido pelo usuário. Autoria e direitos permanecem com os titulares indicados na fonte.

---

```text
VALIDAÇÃO DA BASE LOCAL SPEAKUP

Build de produção com Vite concluído. Resultado final: 25 verificações aprovadas, zero falhas (inclui o teste agrupador PostgreSQL). Testes de domínio e de PostgreSQL em memória com btree_gist executados. Verificam parser CSV, 19 cabeçalhos, validação por linha/coluna, upsert, rollback de lote, matrícula com zeros, conflitos, reserva/remarcação, lotação e permissões entre papéis/empresas. O contexto auth.uid() é simulado nos testes SQL; Supabase Auth e a Edge Function não foram executados em uma conta real.

Não foram executados testes de concorrência em múltiplas conexões, carga, SLA, TLS/AES, retenção externa ou entrega de notificações. Não foi possível concluir revisão visual interativa: o controle do Safari retornou repetidamente noWindowsAvailable e avisos de mudança da aplicação durante as ações. O projeto Lovable não foi criado ou confirmado por esses controles.

A demonstração local funciona sem credenciais Supabase. O modo conectado não utiliza dados fictícios caso falhe a consulta ao backend. Dependências instaladas e pnpm-lock.yaml incluído para reprodutibilidade.

```
