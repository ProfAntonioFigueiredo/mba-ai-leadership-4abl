# Atividade 3 Preparar a identificação dos alunos

Escopo confirmado para a aula de 28/10/2026: somente o item 4.1, preparação do cadastro para ligar cada aluno ao `id_aluno` da planilha de Machine Learning. O enunciado completo foi ingerido; importação de previsões, campanhas e oferta no login ficam para a continuação.

## Cadastro e identidade

O SpeakUp já possui `tb_aluno.id_aluno`, chave textual única usada no login, nas reservas, no perfil, nos vínculos empresariais e nas notas. Há suporte a matrículas como `001` e `AL-23`. Converter essa chave para inteiro fundiria identidades ou quebraria os vínculos existentes.

A preparação adiciona `tb_aluno.id_aluno_ml`, inteiro `BIGINT` único, positivo e limitado a `9007199254740991`, para permitir representação exata no navegador. Esse campo corresponde à coluna `id_aluno` do Excel. A matrícula textual permanece intacta.

| Matrícula atual | ID do Excel | Comportamento |
| --- | --- | --- |
| `10045` | `10045` | Preenchimento automático |
| `001` | Não associado | Associação explícita a partir da fonte de alunos |
| `AL-23` | Não associado | Associação explícita a partir da fonte de alunos |
| Número fora do limite seguro | Não associado | Revisão da origem necessária |

As matrículas numéricas canônicas recebem automaticamente o mesmo número na preparação da base e nas próximas importações de alunos. Não se geram números arbitrários para matrículas legadas: o ID precisa corresponder ao aluno do Excel, e não à posição da linha ou à próxima sequência disponível. A planilha de previsão, com apenas ID e probabilidade, não prova identidade nominal.

## Usar a tela

Entre como **Coordenação** e abra **Identificação para ML**. A página mostra matrícula, ID do Excel e situação do vínculo, com busca e paginação. Para uma matrícula pendente, clique em **Associar ID**, informe o inteiro e confirme a conferência na fonte de alunos antes de registrar.

O sistema rejeita duplicidades e não permite renumerar um vínculo existente pela tela. A reimportação preserva os vínculos manuais, o login e as senhas. Corrigir um vínculo já definido exige revisão administrativa dos dados de origem e de suas dependências antes de qualquer migração específica.

Na demonstração, os seis alunos fictícios possuem matrículas numéricas compatíveis. Os vínculos são mantidos no estado local e persistidos junto às operações do aplicativo; recarregar também recalcula os vínculos automáticos. Nenhuma conta real é criada pela preparação.

## Supabase

Migração: `supabase/migrations/202610280001_student_ml_identity.sql`, após as migrações existentes.

Ela adiciona o campo e suas restrições, preenche somente vínculos automáticos seguros, cria o trigger de importação e disponibiliza a RPC `link_student_ml_id(p_student text, p_ml_id bigint)`. A RPC exige perfil `admin`; alunos, professores, RH e chamadas anônimas não podem vincular IDs. A escrita direta continua revogada. A RPC registra auditoria do vínculo manual.

O `workspace_data` existente já serializa as colunas do cadastro para a Coordenação e para o próprio aluno; por isso, devolve também o novo campo sem precisar alterar as referências textuais existentes.

A migração foi testada no PostgreSQL local em memória via PGlite. Não foi aplicada a nenhum projeto Supabase remoto. A tela apresenta orientação se um ambiente conectado ainda não devolver o novo campo.

## Continuação da atividade

Quando o item 4.2 for implementado, o vínculo será `previsao.id_aluno → tb_aluno.id_aluno_ml → matrícula do cadastro`. IDs da previsão sem cadastro correspondente devem permanecer sem vínculo; importar uma previsão não autoriza criar pessoas ou contas.

Para campanhas, a decisão já informada pelo grupo é **impedir sobreposição de campanhas ativas na faixa de risco e no período**. Essa regra foi apenas registrada para a próxima etapa; nenhuma campanha ou desconto foi cadastrado.

## Validação

`npm test` cobre representação numérica segura, preservação de zeros e matrículas alfanuméricas, novos cadastros, reimportação, vínculos manuais, colisões, permissões e integridade dos relacionamentos. `npm run build` valida a integração React. O PostgreSQL em memória não substitui testes de autenticação e implantação no Supabase real.
