# Resumo da Aula 04 de Machine Learning e Hiperpersonalização

Aula de 28 de outubro de 2026, MBA AI Leadership, disciplina Vibe Coding Executivo. O exercício EnglishPro conectou dados históricos, treinamento de um modelo de cancelamento, previsão para alunos atuais e ofertas de retenção no aplicativo SpeakUp. Os notebooks permitem repetir os cálculos; o aplicativo transforma a previsão em uma experiência personalizada após o login.

## Conceitos e decisões de negócio

Churn representa o cancelamento. As features são características observadas do aluno; o rótulo `cancelou_60_dias` indica o desfecho que o modelo aprende a prever. Separar treino e teste permite avaliar casos que o modelo não usou para aprender. O identificador do aluno e o próprio rótulo ficam fora das entradas.

A AUC mede a capacidade de ordenar alunos por risco, sem equivaler à porcentagem de acertos nem garantir probabilidades calibradas. Um falso positivo pode gerar desconto desnecessário; um falso negativo pode deixar passar um cancelamento. A escolha do limiar e da campanha depende desses custos. Correlação entre presença, atrasos e cancelamento não demonstra causalidade.

Hiperpersonalização significa usar os dados de cada aluno para selecionar uma oferta apropriada. O exercício exige código realmente executado, conferência dos resultados e implementação incremental: enviar um prompt por vez, testar e corrigir antes de avançar. Um risco alto também pode justificar contato pedagógico ou financeiro, além de desconto. O exercício não mediu aumento de retenção ou retorno financeiro.

## Atividade 1 Treinamento do modelo

Foram analisados 5.400 alunos, com 1.110 cancelamentos, taxa de 20,56%. A divisão utilizou 4.050 registros para treino e 1.350 para teste, com semente 42. As cinco entradas foram tempo de casa, inadimplência histórica, parcelas atrasadas nos últimos 90 dias, presença e acessos à plataforma nos últimos 30 dias.

| Modelo | AUC no teste | Acurácia no teste |
| --- | ---: | ---: |
| Random forest | 0,8733 | 85,93% |
| Regressão logística | 0,8699 | 85,78% |

Random forest venceu pelo critério de AUC solicitado. A diferença pequena não comprova superioridade estatística. No limiar ilustrativo de 50%, houve 50 falsos positivos e 140 falsos negativos. A presença teve a maior importância por permutação, seguida de parcelas atrasadas, inadimplência histórica, tempo de casa e acessos. Os contrastes calculados associaram maior presença, tempo de casa e acessos a menor risco; atrasos e inadimplência a maior risco.

Entregas: [notebook executado](atividade-1-notebook/Atividade_1_EnglishPro_Treinamento.ipynb), [instruções](atividade-1-notebook/LEIA-ME.txt), [métricas e rastreabilidade](atividade-1-notebook/resultados/resumo_execucao.json), gráficos, comparações, previsões de teste e modelo serializado em `resultados/`. A validação temporal e uma amostra independente adicional continuam necessárias para uso operacional.

## Atividade 2 Previsão para os alunos atuais

O mesmo modelo salvo foi aplicado a 13.000 alunos, sem novo treinamento. As probabilidades variaram de 0% a 98,9%. O Excel contém somente `id_aluno` e `probabilidade_churn`, com valores numéricos de 0 a 100 e uma casa decimal.

| Faixa de churn | Alunos | Percentual da base |
| --- | ---: | ---: |
| 0 a menos de 20% | 8.663 | 66,64% |
| 20 a menos de 40% | 1.925 | 14,81% |
| 40 a menos de 60% | 972 | 7,48% |
| 60 a menos de 80% | 888 | 6,83% |
| 80 a 100% | 552 | 4,25% |

As faixas usam os valores arredondados exportados. Foram conferidos esquema, tipos, ordem, precisão, registros e hashes. Entregas: [notebook executado](atividade-2-notebook/Atividade_2_EnglishPro_Previsao_Churn.ipynb), [Excel de previsão](atividade-2-notebook/resultados/EnglishPro_Previsao_Churn.xlsx), [resumo da execução](atividade-2-notebook/resultados/resumo_execucao.json), distribuição e análise dos dez maiores riscos.

## Atividade 3 Integração administrativa no SpeakUp

A aplicação está em `../../projetos/speakup/speakup-lovable`. O roteiro EnglishPro foi adaptado aos nomes e ao cadastro já existentes no SpeakUp.

1. **Identificação para ML:** criado o identificador numérico único `id_aluno_ml`, preservando o identificador textual original usado pelo login. A importação atribui os números automaticamente, e a área administrativa permite conferir o vínculo com o Excel.
2. **Previsão de Churn:** upload de `.xlsx`, prévia das dez primeiras linhas, validação dos registros, atualização sem duplicação, lotes de 500, progresso, totais e consulta por faixa. A demonstração foi conferida com as 13.000 previsões.
3. **Campanhas de Retenção:** cadastro, edição, exclusão e ativação, com faixa, desconto, título, mensagem com `{nome}`, período e contagem de previsões na faixa. A decisão do grupo impede sobreposição entre campanhas ativas quando coincidem faixa e período; a restrição também existe no banco para proteger gravações concorrentes.

O limite mínimo é inclusivo e o máximo exclusivo, exceto 100%, que pertence à última faixa. O último dia de validade é incluído. Os descontos de 5%, 10%, 15%, 20% e 25% são referências do roteiro, sujeitos à decisão de negócio. A contagem na faixa não representa ofertas aceitas nem pessoas únicas entre períodos diferentes.

## Etapa 4 Oferta personalizada no login do aluno

Após o login, o sistema associa o aluno à previsão e procura uma campanha ativa, vigente e compatível com sua faixa. O pop-up mostra título, mensagem com o primeiro nome, desconto, validade e as ações “Quero garantir minha rematrícula” e “Agora não”. A probabilidade de churn não é enviada na resposta de oferta nem exibida ao aluno.

Exibição e resposta são registradas com data e hora. Aceite ou recusa impedem nova apresentação da mesma campanha para aquele aluno. Fechar sem responder mantém o registro como “sem resposta” e permite nova apresentação em outro login. Repetições da mesma solicitação não duplicam a exibição; respostas repetidas preservam a primeira decisão. Sem previsão ou campanha elegível, nada aparece.

O teste visual mostrou “Campanha Fidelidade” para Beatriz, com mensagem personalizada e desconto de 5%. A campanha foi ativada temporariamente e restaurada como inativa; não foi registrado aceite ou recusa no teste visual. Para usar a oferta, é necessário ativar uma campanha vigente. O aceite registra interesse: a rematrícula e a concessão financeira dependem da continuidade do atendimento.

Entregas: [documentação funcional](../../projetos/speakup/speakup-lovable/docs/atividade-3-oferta-login.md), [evidência visual](atividade-4-oferta-login/oferta-personalizada-login.png) e migração `202610280004_student_retention_offer.sql`.

## Manutenção visual do StartupOne

O padrão editorial didático da Aula 04 foi aplicado ao portal e à biblioteca em `../../../StartupOne-MBA/startupone-mba`: fundo branco, roxo `#1F0A34`, turquesa `#43BCCD`, cartões azul-claro e fontes Ubuntu locais. O tema compartilhado fica em `tema.css`; os layouts específicos continuam em seus arquivos de estilo.

Foram preservados os textos e links das 15 páginas, conferidos 66 arquivos por hash e verificados 482 destinos locais. O conversor foi ajustado para importação sem execução automática e manutenção sem duplicar elementos. A aparência não foi validada no navegador nessa manutenção, e a conversão integral não foi executada. O ZIP de compartilhamento existente foi preservado e não foi regenerado com o tema atualizado. Detalhes em [VERIFICACAO.txt](../../../StartupOne-MBA/startupone-mba/VERIFICACAO.txt).

## Execução e estado final

O aplicativo requer Node 20.19+ ou 22.12+ e npm ou pnpm. Na pasta do SpeakUp, instale dependências com `npm ci`, execute com `npm run dev`, confira com `npm test` e gere a versão de distribuição com `npm run build`. Os ambientes Python dos notebooks são reconstruídos com seus respectivos `requirements.txt`; consulte os arquivos `LEIA-ME.txt` para escolher o kernel e localizar as planilhas.

A suíte completa do aplicativo terminou com 116 testes aprovados, incluindo regras de negócio, permissões e migrações em banco local de teste. O build foi aprovado. As quatro migrações SQL de 28/10/2026 estão prontas no repositório, mas não foram aplicadas a um Supabase remoto. O demo mantém alterações no navegador; esse estado local não é transportado pelo Git. Dados e campanhas precisam ser importados ou cadastrados novamente em outro ambiente.

## Materiais da aula

- [Apresentação de Machine Learning e Hiperpersonalização](Aula-04-FIAP-Vibe-Coding-Machine-Learning-e-Hiperpersonalizacao.pdf).
- [Recapitulação de Vibe Coding](Recap%20-%20Vibe%20Coding.pdf).
- Enunciados e planilhas originais na pasta `Aula 04 - Atividades `, cujo nome termina com espaço; extrações textuais nas pastas de cada atividade.
- Notebooks, resultados, imagens de validação, código, testes e migrações compõem o registro reproduzível das entregas.
