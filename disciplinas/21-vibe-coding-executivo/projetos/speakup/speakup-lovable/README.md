# SpeakUp Idiomas

Base de aplicação React para a plataforma B2B descrita no PRD e no PSS da aula. Destino escolhido: **Lovable + Supabase próprio**. O pacote contém os prompts, uma demonstração funcional no navegador e uma implementação inicial do backend em SQL/Edge Function. Nenhum projeto foi criado em contas externas: os dois conectores estão desabilitados pelo administrador da sessão.

## Usar no Lovable

1. Crie um projeto no Lovable e selecione seu projeto Supabase próprio no seletor de banco. A conexão entre contas deve ser feita pelo proprietário autorizado. Não coloque service role ou senhas no chat.
2. Use o bloco `SYSTEM PROMPT` de `03_SYSTEM_PROMPT_KERNEL_SUPABASE.txt` nas instruções/conhecimento do projeto.
3. Cole integralmente `02_PROMPT_DE_IGNICAO_LOVABLE.txt` no chat do projeto. Ele é autossuficiente: descreve todos os requisitos e as etapas, sem depender dos documentos Word.
4. Revise o plano e as migrações geradas. A pasta `src` e a migração deste pacote são uma base revisável para a implementação. Não suponha que existe importação automática de um repositório local para o Lovable; use o fluxo de código/Git suportado no seu projeto.
5. Valide autenticação, isolamento entre empresas e concorrência no Supabase de desenvolvimento antes de carregar dados reais.

Referências oficiais consultadas em 14/10/2026: [conectar Supabase ao Lovable](https://docs.lovable.dev/integrations/supabase), [sincronização Git](https://docs.lovable.dev/integrations/github), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Rodar a demonstração

Requer Node 20.19+ ou 22.12+ e um gerenciador npm/pnpm.

```sh
npm install
npm run dev
```

Abra a URL informada pelo Vite. Sem variáveis de ambiente, os dados são inteiramente fictícios e persistem no localStorage deste navegador. Aluno de teste: matrícula `10045`, senha `Escola@@@`. As abas permitem explorar coordenação, professor e RH com a mesma senha somente na demonstração. O RH demo está limitado à empresa fictícia Acme Brasil; a associação por unidade é apenas um recurso dos dados fictícios.

Fluxos do piloto: login, agenda, reserva/cancelamento/remarcação, prevenção de conflitos, criação de aulas pela coordenação, base de alunos, importação CSV/XLSX com prévia, chamada e indicadores. Créditos, notificações reais, evolução histórica CEFR, substituição automática, medição e SSO/ERP permanecem em etapas posteriores. A aprovação de medição prevista em RF-06 depende da etapa RF-08 e não está implementada.

## Backend Supabase de desenvolvimento

1. Revise e aplique `supabase/migrations/202610140001_speakup.sql` em projeto **novo de desenvolvimento**. Não aplicar em banco existente sem revisão de compatibilidade. A migração cria tabelas, RPCs, grants e RLS; o exemplo MySQL do PSS foi traduzido para PostgreSQL.
2. Crie contas de equipe no Supabase Auth com senhas individuais. Vincule `auth.users.id` a `profiles.user_id`, atribuindo `role`, `name`, `teacher_id` ou `company_id` no contexto administrativo. Não há autoatribuição de papéis. Para professores, o nome do perfil deve corresponder ao cadastro de `teachers` usado pelas aulas.
3. Cadastre `companies` e os vínculos `student_companies`. **Unidade não determina a empresa em produção.** O RH recebe indicadores e reservas anonimizadas, sem base de alunos completa.
4. Importe alunos pelo perfil ADM. A importação cadastra/upserta a base, mas não cria contas Auth. Para provisionar cada matrícula, execute `node scripts/provision-student.mjs MATRICULA` em terminal seguro com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` definidos no ambiente. O script nunca reseta conta existente. O endereço técnico de login é o hash SHA-256 da matrícula em domínio reservado `.invalid`, separado do e-mail de contato.
5. Implante a Edge Function `student-login`, usando `supabase/config.toml`. Configure `ALLOWED_ORIGIN` como a origem exata da aplicação (sem barra final). Habilite limites de tentativa/rate limiting no ambiente de destino e valide a proteção do endpoint antes de exposição real. A função autentica com Supabase Auth e revalida matrícula ativa.
6. Copie `.env.example` para `.env.local` e preencha somente URL e chave pública/publicável. A service role fica exclusivamente no terminal/backend. O Vite passa a usar Supabase quando as duas variáveis existem; nesse modo não há fallback silencioso para o demo.
7. Reinicie o Vite. As RPCs devolvem dados conforme perfil. Perfis privilegiados precisam ser cadastrados por operador autorizado. Realize testes reais com duas empresas e dois professores, credenciais inválidas, aluno inativo e chamadas de API diretas.

O piloto carrega dados no login e após suas próprias mutações. Atualização automática entre usuários, paginação no servidor e painel em tempo real precisam ser concluídos no Lovable; a lista administrativa tem paginação apenas no cliente nesta base. Não usar essa versão como entrega completa de RF-06/RNF-06.

## Importação

Baixe o modelo na tela ou use `examples/modelo-alunos.csv`. São exigidas as 19 colunas oficiais na ordem exibida no PRD. Use UTF-8, delimitador vírgula ou ponto e vírgula, datas YYYY-MM-DD e valores decimais com ponto. No XLSX, prefira matrícula e datas ISO como **texto**; um valor numérico salvo pelo Excel já perdeu possíveis zeros iniciais, que não podem ser reconstruídos.

O lote tem prévia das primeiras 20 linhas, mas todas são validadas. Há indicação de linha/coluna; qualquer erro bloqueia a confirmação. O servidor também valida e executa a carga de modo transacional. Limites do piloto: arquivo de 5 MB e lote de até 5.000 linhas. Ordem exata, limites, atomicidade, valores não negativos e percentual 0–100 são decisões técnicas revisáveis, não respostas preenchidas no configurador.

## Validar

```sh
npm test
npm run build
```

Os testes de domínio cobrem importação, matrícula, datas, campos, conflitos e remarcação com falha. Os testes SQL, quando presentes no pacote, usam PostgreSQL local em memória via PGlite e simulam o contexto de identidade. Eles não substituem os testes de Auth, rede, concorrência multiusuário e implantação no Supabase real.

## Limites que impedem produção

A senha compartilhada `Escola@@@` foi mantida conforme o requisito de aula, que alterna os termos fixa e inicial. A política definitiva depende de decisão do responsável. Não foram certificados TLS 1.3, AES-256, conformidade LGPD, SLA, 5.000 usuários, resposta em 2 segundos, backups ou retenção imutável por 12 meses. O trigger de auditoria protege contra operações normais de alteração; o proprietário do banco continua tendo poder administrativo. Nenhuma fatura, e-mail ou calendário conectado é simulado como concluído.

A identidade visual verde é uma proposta para revisão, pois o material não traz Design System aprovado. Os documentos originais permanecem preservados. O diagnóstico rastreável está em `01_DIAGNOSTICO_E_CONSOLIDACAO.txt`.

## Importação administrativa com login automático

A tela **Importação de Alunos** oferece prévia, mapeamento de colunas, confirmação, tratamento conservador de duplicidades e relatório de resultados. Novas contas usam Id_aluno e senha Escola@@@; contas existentes mantêm suas senhas. Todos os status podem fazer login, com reservas restritas a matrícula Ativa.

Para gravar no Supabase e provisionar contas, aplique a nova migração e publique a função `import-students` conforme [docs/importacao-alunos.md](docs/importacao-alunos.md). Sem configuração, a aplicação continua em modo demo no navegador. Essa documentação atualiza as instruções anteriores de provisionamento manual e de bloqueio de login por matrícula inativa.

## API de Consulta de Notas — Atividade 2

Coordenação e RH encontram a página **API de Notas**, com ID, nome, botão **Testar API**, resposta HTTP integral e **Baixar Documentação**. Empresas precisam de autorização explícita e só consultam alunos vinculados à sua empresa. Veja [o documento da integração](docs/api-notas.md) e [a ativação pela escola](docs/api-notas-operacao.md).

O modelo anterior não possuía notas: as estruturas novas começam vazias. Não foram criadas notas fictícias. É preciso conectar a fonte oficial para retornar disciplinas e resultados reais. A consulta fica indisponível em demo; aluno existente sem notas retorna lista vazia no ambiente configurado.

## Modo atual da atividade — consulta local de ID

A atividade foi ajustada: não há notas a integrar e não é necessário configurar Supabase. Na Coordenação, abra **API de Alunos**, informe apenas o ID e clique em **Testar API**. O nome é opcional no modo local. O retorno mostra ID, nome e status do cadastro, sem inventar notas. O botão **Baixar Documentação** entrega o guia local.

Veja [o contrato e o uso da consulta local](docs/api-alunos-local.md). Não há endpoint HTTP público neste modo. As instruções Supabase anteriores ficam reservadas à futura integração entre sistemas.

## Dicas para melhorar o inglês — Atividade 3

Entre como **Aluno**, abra **Dicas para melhorar o inglês** e clique em **Buscar dicas**. A aplicação consulta por GET a API pública `https://vibe-coding-frontend-backend.lovable.app/api/public/dicas`, sem chave ou credenciais, e apresenta os cartões com número, título, explicação, exemplo em inglês, tradução e nível.

Funciona também no modo atual, sem Supabase. A busca ocorre apenas ao clicar; há mensagens de carregamento, lista vazia e erro, limite de espera de 15 segundos e cancelamento ao sair da página. Nenhum dado do aluno é enviado à API. **Atualizar dicas** permite repetir a consulta. Documentação do fornecedor: https://vibe-coding-frontend-backend.lovable.app/api/public/dicas/docs.

## Memory Game — Atividade 4

Na área do **Aluno**, abra **Memory Game**. O tabuleiro tem cinco colunas e cinco linhas: 24 cartas (12 pares inglês/português) e o placar na última posição. Cada par vale 10 pontos; uma tentativa é contada ao escolher a segunda carta. Erros não retiram pontos. Pares incorretos ficam visíveis por um segundo, com as demais cartas bloqueadas. **Novo Jogo** zera a partida e embaralha as cartas.

O painel **Como o FrontEnd funciona** acompanha estado, renderização e reatividade. A partida é mantida em memória enquanto a página do jogo permanece aberta; sair da página ou recarregar reinicia o jogo. Não exige API externa nem Supabase e não altera cadastros ou notas.
