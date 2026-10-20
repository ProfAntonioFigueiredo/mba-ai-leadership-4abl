# Cenários de aceite
Os identificadores vinculam intenção a testes; critérios futuros não são declarados como atendidos.

- AC-01 / ENG-01: Dado somente URL ou chave Supabase, ao selecionar o modo, falhar com mensagem; sem nenhuma variável, demo; com ambas, backend. Teste configuration.test.mjs.
- AC-02 / RF-01, ENG-02: Dado início depois do fim em UTC mesmo com ordenação textual diferente, rejeitar. Datas inválidas e capacidade 0/101/fracionária também são rejeitadas. Teste regression.test.mjs.
- AC-03 / RF-02: Dada reserva ativa, ao remarcar para a mesma aula, rejeitar sem alterar estado. Conflitos usam instantes equivalentes com offsets. Teste regression.test.mjs; testes legados cobrem sucesso/rollback.
- AC-04 / RF-13: Dado lote com 5.001 alunos, rejeitar antes da prévia; 5.000 é limite técnico do piloto, já usado no backend original. Inteiro fora de faixa produz erro de coluna. Teste regression.test.mjs.
- AC-05 / RF-13: Dada prévia válida, ao selecionar arquivo inválido, remover prévia antiga e impedir confirmação. Teste browser/import.spec.js.
- AC-06 / RNF-01: Dado modal de reserva aberto, receber foco dentro dele, conter navegação por Tab, fechar com Escape e devolver foco ao acionador. Teste browser/booking.spec.js.
- AC-07 / RNF-05, RF-06: Dados alunos de empresas A/B em uma aula compartilhada, RH A vê somente ocupação correspondente a A. Teste database.test.mjs, novo subteste AC-07.
- AC-08 / RF-02: Dado aluno demo ativo, reservar horário livre, confirmar sucesso e atualizar agenda. Teste browser/booking.spec.js.
- AC-09 / RNF-05: usuário anônimo não chama RPC, aluno não importa, professor não altera chamada de outro professor e RH não recebe cadastro pessoal. Teste SQL herdado.
- AC-10 / ENG-02: instantes inválidos em reserva falham sem mutação. Teste regression.test.mjs.

## Validações externas ainda necessárias
Supabase Auth/Edge real, concorrência em conexões PostgreSQL independentes, latência e carga, e-mail/calendário, backup/restore, acessibilidade com leitor de tela, testes completos de todos os perfis e revisão de privacidade. PGlite simula identidade SQL, não JWT/rede/Auth.

- AC-11 / RNF-01: viewport 390×844, dashboard de aluno sem overflow horizontal; captura visual. Teste browser/booking.spec.js. Não substitui auditoria completa de usabilidade.
