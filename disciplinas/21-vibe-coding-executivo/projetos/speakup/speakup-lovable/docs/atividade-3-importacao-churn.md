# Atividade 3 Importar a previsão de churn

Etapa 4.2 da aula de 28/10/2026. Na **Coordenação**, abra **Previsão de Churn**, escolha o Excel gerado na Atividade 2, confira a prévia e clique em **Confirmar importação de churn**.

## Arquivo e prévia

O formato exige uma única aba, cabeçalho na primeira linha e exatamente duas colunas nesta ordem:

| id_aluno | probabilidade_churn |
| --- | --- |
| 10045 | 37.5 |

Os valores precisam ser células numéricas do Excel. O ID é inteiro positivo e seguro no navegador, até `9007199254740991`. A probabilidade é um número finito entre 0 e 100; `0` e `100` são válidos. O número `37.5` significa 37,5%. Texto numérico, taxas fora da faixa, datas e células vazias são rejeitados, sem conversão silenciosa.

Limites da tela: 5 MB e 100.000 linhas. A prévia mostra as dez primeiras linhas, o total e a quantidade com problemas. Todas as linhas são validadas antes da gravação. Quando um ID se repete no arquivo, todas as suas ocorrências são rejeitadas, mesmo em lotes diferentes. Linhas válidas podem ser confirmadas apesar das rejeições; o resultado e o relatório CSV discriminam cada linha.

## Gravação e continuidade

A confirmação envia lotes de até 500 linhas. Cada lote faz upsert por `id_aluno`, grava `probabilidade_churn` e atualiza `data_importacao`. Reimportar o mesmo arquivo atualiza as previsões sem criar registros duplicados. Não há arredondamento adicional da probabilidade no banco.

A barra mostra a quantidade de linhas processadas e o percentual. Se ocorrer falha, os lotes já confirmados são preservados. O resultado diferencia importados, atualizados, rejeitados, sem confirmação e não processados. Uma resposta perdida depois de uma gravação pode deixar o lote sem confirmação; confira a consulta e reenvie o arquivo para reconciliar o estado.

Mantenha a tela aberta durante a operação. Sair da página interrompe o envio dos próximos lotes; um lote já enviado ao servidor pode terminar mesmo após a saída. A importação inteira não é uma transação única: cada lote é confirmado separadamente.

## Consulta administrativa

A mesma página exibe cinco faixas: `[0,20)`, `[20,40)`, `[40,60)`, `[60,80)` e `[80,100]`. Portanto, exatamente 20 pertence à segunda faixa, e 100 à última. O resumo considera todas as previsões, independentemente da busca ou da página atual.

A tabela permite pesquisar por ID ou nome e usa ordenação por probabilidade decrescente, com desempate por ID crescente. Ela exibe 20 linhas por página. Em Supabase, a paginação e a busca ocorrem no servidor.

O nome vem exclusivamente do vínculo `churn_previsao.id_aluno = tb_aluno.id_aluno_ml` preparado na etapa 4.1. IDs sem cadastro são importados e aparecem como **Sem cadastro vinculado**. A importação não cria pessoas, matrículas ou contas e não associa o risco pela posição das linhas.

## Demonstração e Supabase

Sem Supabase configurado, os lotes são gravados em `churnPredictions` no estado local do navegador, junto da demonstração existente. Não há envio remoto. O limite de armazenamento do navegador pode interromper a importação; esse caso aparece no relatório, sem declarar sucesso indevido.

Para um Supabase conectado, aplique primeiro as migrações existentes e a de identificação da etapa 4.1; depois aplique `supabase/migrations/202610280002_churn_import.sql`. A migração cria:

- `public.churn_previsao`, com chave única por ID, intervalo numérico e data de importação;
- `import_churn_predictions(p_rows jsonb)`, para lotes de 1 a 500;
- `churn_admin_data(p_search text, p_page integer, p_page_size integer)`, para consulta paginada.

As duas RPCs exigem perfil `admin`. A tabela tem RLS e não permite acesso direto por `anon` ou `authenticated`. Alunos, professores e RH não podem ler ou importar previsões. O `workspace_data` não passa a devolver probabilidades para outros perfis. A auditoria registra as contagens de cada lote.

Nada foi implantado em um Supabase remoto nesta entrega. O modo demo permite conferir o fluxo local; as migrações e os controles de acesso foram executados em PostgreSQL local em memória via PGlite.

## Arquivo da aula

`aulas/Aula-04/atividade-2-notebook/resultados/EnglishPro_Previsao_Churn.xlsx` contém 13.000 previsões, distribuídas em 26 lotes de 500. Na validação com o arquivo real, a primeira carga inseriu 13.000 IDs e a segunda atualizou os mesmos 13.000, mantendo o total.

| Faixa de churn | Alunos |
| --- | ---: |
| 0–20% | 8.663 |
| 20–40% | 1.925 |
| 40–60% | 972 |
| 60–80% | 888 |
| 80–100% | 552 |

Os seis cadastros fictícios da demonstração têm IDs correspondentes; os demais ficam sem cadastro nominal no demo. Isso não significa que a escola real tenha apenas seis alunos.

## Continuação

Esta etapa não cadastra campanhas nem exibe ofertas para alunos. Para a etapa 4.3, permanece registrada a decisão do grupo de impedir sobreposição de campanhas ativas por faixa de risco e período.
