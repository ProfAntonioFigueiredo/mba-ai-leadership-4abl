# Importação de Alunos

Na Coordenação, abra **Importação de Alunos**, selecione **Importar Excel**, revise o mapeamento e as linhas e pressione **Confirmar Importação**. A base de alunos existente continua disponível na gestão de alunos.

## Comportamento

- Modelo: as 19 colunas de `examples/modelo-alunos.csv`, também disponível no botão Baixar modelo. A ordem pode variar; nomes equivalentes como Matrícula, Curso, Status e Mensalidade são reconhecidos. Colunas ausentes, desconhecidas ou ambíguas bloqueiam a leitura para evitar perda de informações.
- XLSX e CSV até 5 MB e 5.000 alunos; datas Excel e DD/MM/YYYY, mensalidade brasileira e IDs textuais são normalizados. Formate IDs como texto no Excel se houver zeros à esquerda.
- Prévia das primeiras 100 linhas, com validação de todas. Registros inválidos são rejeitados individualmente; os válidos podem ser confirmados.
- ID é a chave de atualização. ID repetido no arquivo rejeita todas as ocorrências. Mesmo ID com outro nome/e-mail ou mesmo e-mail em outro ID exige revisão manual. O backend repete a checagem de identidade sob lock transacional. Campos vazios não apagam informações existentes.
- Apenas `admin` vê a tela; a Edge Function valida usuário e papel no servidor, e a RPC revalida o papel no banco. Service role permanece exclusivamente no servidor.
- Novas contas Auth: login com `id_aluno` via `student-login`, senha `Escola@@@`, vínculo `profiles.role=student`. O e-mail técnico é o SHA-256 do ID, separado do e-mail de contato. Senhas existentes não são resetadas nem contas de outros perfis reassociadas automaticamente.
- Conforme escolha do usuário, todos os status podem fazer login. Reservas/remarcações continuam exigindo matrícula Ativa, tanto no demo quanto no servidor.
- Resumo: importados, atualizados, rejeitados, sem confirmação, login pronto e login pendente. O relatório CSV inclui motivos por linha. Em falha de rede o resultado é “sem confirmação”, pois o servidor pode ter gravado o registro.
- Cadastro e Auth são operações diferentes: falha de Auth mantém o aluno salvo e sinaliza login pendente. Reenvie a mesma planilha para retomar o provisionamento sem duplicar dados. Conta criada sem perfil pode ser recuperada pelo e-mail técnico. Não há transação única entre Auth e PostgreSQL.
- Sem Supabase configurado, o fluxo grava somente dados fictícios em localStorage. Não são criadas contas remotas nesse modo.

## Ativação no banco existente

Esta implementação não aplicou alterações em banco remoto. Na sessão de desenvolvimento não havia `.env.local`, CLI Supabase ou credenciais Supabase no processo.

1. Revise e aplique `supabase/migrations/202610210001_student_import.sql` no mesmo projeto Supabase que já tem a migração `202610140001_speakup.sql`. Faça backup e valide em desenvolvimento antes da promoção. A nova migração preserva tabelas e dados; restringe o upsert antigo, adiciona importação conservadora e separa acesso de aluno da permissão de reservar aulas.
2. Publique a Edge Function `import-students` com a configuração de `supabase/config.toml`. Em ambiente com Supabase CLI instalado e projeto vinculado: `supabase functions deploy import-students`. O módulo `_shared/student-import.mjs` deve acompanhar a função. O gateway não valida JWT nesta configuração; a própria função o valida com `auth.getUser` e verifica `current_role` antes de qualquer uso de service role.
3. Configure `ALLOWED_ORIGIN` com a origem exata da interface, sem barra final. URL, chave anon e service role são lidas apenas no ambiente da função. A Edge Function `student-login` existente deve permanecer publicada.
4. Configure `.env.local` no frontend com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, conforme `.env.example`, e reinicie o Vite. Não use service role em variáveis VITE.
5. Autentique uma conta com perfil `admin`, importe a planilha e verifique o resumo. Teste login com uma conta nova e matrícula inativa; confirme que a matrícula inativa não reserva aulas.

A nova função aceita até 20 linhas por requisição; a interface envia uma por vez para mostrar progresso e facilitar retomadas. Mantenha a página aberta durante a importação. O importador não transforma cadastros existentes de outros perfis em alunos.

## Validação realizada

- Planilha real `EnglishPro_Gold_Base para Vibe Coding.vfinal.xlsx`: 19 colunas, 50 registros inicialmente válidos.
- Navegador Microsoft Edge headless: upload real, prévia, confirmação de 50 novos alunos no demo, reimportação sem duplicados e login de aluno inativo.
- PostgreSQL local (PGlite): migração, conflitos, preservação de campos vazios, restrição administrativa, revogação de acesso à função antiga, acesso com matrícula inativa e bloqueio de reservas.
- Testes unitários: mapeamento/normalização, duplicidades, criação de conta, preservação de senha existente e recuperação de provisionamento parcial.
- Auth e Edge em Supabase remoto não foram executados. O provisionamento foi verificado por testes com clientes simulados.

Para validar outro Excel sem gravar dados: `node scripts/inspect-import.mjs "CAMINHO_DO_EXCEL"`. Não imprime dados pessoais, apenas cabeçalhos, contagens e tipos de erro.

O script opcional `scripts/verify-import-browser.mjs` usa Playwright já disponível no ambiente e Microsoft Edge. Recebe o caminho da planilha; `PLAYWRIGHT_MODULE` pode apontar para o módulo instalado em outro diretório. É um teste específico da planilha de 50 registros e deve rodar contra demo limpo em `http://127.0.0.1:5175`.

Resultado final: 36 testes aprovados e build concluído. Nenhum banco remoto foi alterado nem conta real criada nesta sessão.
