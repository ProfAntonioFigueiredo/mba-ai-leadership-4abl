# Ativação da API de notas — equipe da escola

## Estado real

O projeto anterior não contém tabela de notas ou disciplinas. A migração `202610210002_student_grades.sql` adiciona somente estruturas vazias, sem popular alunos ou notas. É necessário identificar e integrar a fonte oficial para obter notas reais. Não use frequência, nível do curso ou mensalidade como nota.

## Preparar o ambiente

1. No Supabase de desenvolvimento existente, revisar/aplicar as migrações em ordem. A nova migração pressupõe `202610140001_speakup.sql`; preserve também a migração da importação já existente.
2. Publicar a função `student-grades`, incluindo `_shared/grades-handler.mjs`, com `supabase functions deploy student-grades`, em ambiente com CLI e projeto já configurados. O gateway JWT está desativado na configuração versionada; a função valida o usuário com `auth.getUser` e a RPC verifica os privilégios no banco.
3. Configurar `ALLOWED_ORIGIN` para a origem exata do frontend. A função usa URL e chave anon do ambiente Supabase; não precisa de service role.
4. Configurar URL e chave pública do frontend em `.env.local`, sem incluir segredos no Git. Reiniciar o Vite.
5. Definir a fonte real de notas, disciplina e situação. Uma vez confirmada, carregar os valores em `student_grades` com ferramenta administrativa ou adaptar a função de consulta para a fonte oficial existente. Não há cadastro nem importação de notas nesta atividade.

## Autorizar uma empresa explicitamente

Use uma conta Auth individual para integração, perfil `rh` com `company_id` correto e vínculo corporativo de alunos em `student_companies`. Depois conceda acesso em `grade_api_access`. O cadastro/provisionamento é uma operação administrativa; a API não aceita autoatribuição de empresa ou papel.

Exemplo de estrutura de autorização (substitua marcadores; não é script pronto para executar):

```sql
insert into public.grade_api_access(user_id, company_id, active)
values ('UUID_REAL_DA_CONTA', ID_REAL_DA_EMPRESA, true);
```

Para revogar: desative `active` na autorização da conta. Se o `company_id` do perfil divergir da autorização, a consulta é recusada. A consulta de notas não concede acesso direto às tabelas nem altera a resposta agregada do painel de RH.

## Dados e contrato

`student_grades` possui `student_id`, `disciplina`, `nota`, `situacao` e `updated_at`, com um resultado por aluno/disciplina. Não há período letivo ou múltiplas avaliações no modelo confirmado; se a fonte real trouxer esses conceitos, alinhe o modelo antes da carga para preservar o histórico. Não se assume escala 0–10 ou regra automática de aprovação.

`consult_student_grades` é uma RPC autenticada com autorização explícita. A função retorna envelope interno com status/corpo; a Edge Function converte para resposta HTTP pública. Administrador consulta qualquer aluno, empresa autorizada consulta somente seus vínculos corporativos. Aluno/professor não recebem esta nova permissão. Nome divergente e aluno fora de escopo têm a mesma resposta 404.

## Entrega da documentação

Documento para o parceiro: `public/api-notas.md` (cópia em `docs/api-notas.md`). O botão no frontend substitui o marcador de URL pela configuração atual. Ao editar o documento, mantenha as duas cópias iguais. Solicite o endereço real da função antes de compartilhar: um placeholder não é um serviço publicado.

## Verificação e limites

Testes locais devem cobrir autorização, isolamento por empresa, ID/nome divergente, ausência de notas, retorno de valores reais de fixtures de teste e erros HTTP. Fixtures em testes não são carga de dados da aplicação. Publicação, autenticação remota e integração da fonte oficial precisam ser validadas no ambiente da escola. Não há conexão Supabase configurada nesta sessão nem evidência de notas reais na base fornecida.

Validação desta entrega: 42 testes aprovados e build concluído. Navegador Edge com Auth/API interceptados: login em modo Supabase, envio de ID/nome com Bearer, exibição literal de resposta HTTP 200/404 e download do documento com URL do ambiente aprovados. O teste também detectou e permitiu corrigir uma colisão de variável no login Supabase (`data` usada antes de inicialização); a variável da leitura do workspace foi renomeada sem alterar o fluxo de autenticação.

Para repetir o teste de tela opcional, use `scripts/verify-grades-browser.mjs` com Playwright disponível (`PLAYWRIGHT_MODULE` pode apontar para a instalação). Ele espera Vite em 5176 com URL fictícia `http://127.0.0.1:59999` e chave pública de teste; todas as chamadas são interceptadas. Não execute contra um ambiente com credenciais reais.

## Atualização de escopo: atividade sem Supabase

A opção atual da atividade é consultar o ID nos cadastros locais, sem notas e sem ativar Supabase. Use **API de Alunos** na Coordenação. Não execute os passos de publicação acima para realizar esta atividade. Consulte `api-alunos-local.md` para o contrato local; não existe URL HTTP pública nesse modo.
