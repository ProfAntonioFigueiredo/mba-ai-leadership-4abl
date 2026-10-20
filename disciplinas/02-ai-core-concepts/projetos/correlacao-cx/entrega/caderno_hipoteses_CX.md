# Caderno de Hipóteses: Experiência do Colaborador no Suporte de TI

**Para:** Diretoria de Suporte de TI
**Disciplina:** AI Core Concepts, Aula 1 (Profª Tassiana Rugoni de Campos). FIAP MBA
**Base:** `metrica_cx_corr_v2.csv`, 420 chamados resolvidos
**Método:** correlação de Pearson. Foram analisados os pares com **r > 0,4 ou r < −0,4**.

---

## 1. Entendimento e preparação da base

| Variável | Significado | Tratamento |
|---|---|---|
| Id | Identificador único da resposta | **Excluído**: é só identificador |
| Age | Idade do colaborador atendido | **5 registros com idade 0** (Ids 17, 286, 297, 320, 413) tratados como dado ausente, por serem provável erro de cadastro |
| Canal | Chat (167), Telefone (143), Portal (110) | Convertido em 3 variáveis 0/1 (*one-hot*) |
| Criticidade | Baixa (218), Média (124), Alta (78) | Convertida em escala ordinal: 1 = Baixa, 2 = Média, 3 = Alta |
| Tempo_Resolucao_h | Horas entre a abertura e a resolução do chamado (média 15,9 h; 1,1 a 71,7 h) | Numérica |
| Status_Chamado | Situação do chamado. Sempre "Resolvido" | **Excluído**: é constante e não varia |
| e_NPS | Disposição do colaborador em recomendar o suporte (0 a 10), o *employee* NPS | Numérica |
| CES | Esforço para resolver o problema (1 = muito fácil, 5 = muito difícil). **Quanto maior, pior** | Numérica |
| RATINGS | Satisfação com o atendimento (1 = muito insatisfeito, 5 = muito satisfeito) | Numérica |

> Os pares Canal × Canal (ex.: Chat × Telefone = −0,58) foram **desconsiderados**. São negativos por construção, já que cada chamado tem um único canal, e não trazem informação de negócio.

---

## 2. Matriz de correlação: pares relevantes (|r| > 0,4)

| # | Par | r | Sentido |
|---|---|---|---|
| 1 | e_NPS × RATINGS | **+0,89** | Forte positiva |
| 2 | Criticidade × Tempo de resolução | **+0,89** | Forte positiva |
| 3 | Idade × Canal Telefone | **+0,74** | Forte positiva |
| 4 | CES × Canal Telefone | **+0,65** | Moderada positiva |
| 5 | Idade × Canal Chat | **−0,62** | Moderada negativa |
| 6 | Criticidade × RATINGS | **+0,59** | Moderada positiva |
| 7 | CES × RATINGS | **−0,54** | Moderada negativa |
| 8 | Criticidade × e_NPS | **+0,53** | Moderada positiva |
| 9 | Idade × CES | **+0,50** | Moderada positiva |
| 10 | e_NPS × CES | **−0,48** | Moderada negativa |
| 11 | CES × Canal Chat | **−0,48** | Moderada negativa |
| 12 | Tempo de resolução × RATINGS | **+0,42** | Moderada positiva ⚠️ |

**Ausências de correlação que também são informação:** Criticidade × CES (0,01), Tempo × CES (−0,02) e Criticidade × Canal (~0).

---

## 3. Hipóteses

### H1: Satisfação é um construto único (e_NPS × RATINGS, r = +0,89)
- **Leitura:** quem dá nota alta ao atendimento também recomenda o suporte.
- **Hipótese:** as duas pesquisas medem **a mesma percepção**? Seria possível **simplificar a pesquisa** e reduzir a fadiga de pesquisa dos colaboradores?
- **Cuidado:** as duas são respondidas no mesmo momento pela mesma pessoa, e é natural que andem juntas.
- **Como validar:** comparar a taxa de resposta e a informação extra de cada uma. Testar uma pesquisa enxuta em um grupo piloto.
- **Ação:** unificar num indicador de satisfação e manter o CES como medida separada de esforço.

### H2: A criticidade define o tempo (Criticidade × Tempo, r = +0,89)
- **Leitura:** chamados de criticidade alta levam em média **48,0 h**, contra **15,9 h** nos de média e **4,5 h** nos de baixa.
- **Hipótese:** chamados críticos são **mais complexos** e dependem de outras equipes ou fornecedores? Ou **o SLA de chamados críticos está sendo descumprido**?
- **Cuidado:** num suporte bem gerido, o esperado seria o contrário: **o crítico ser priorizado e resolvido mais rápido**.
- **Como validar:** comparar com o SLA contratado por criticidade. Mapear quantos escalonamentos e transferências cada chamado crítico teve.
- **Ação:** revisar a fila e a priorização dos chamados críticos, criar um *swarming* (força-tarefa) para incidentes críticos e fixar metas de SLA por nível.

### H3: ⭐ Paradoxo de Simpson: o tempo parece não prejudicar, mas prejudica
- **Leitura "ingênua":** Tempo × RATINGS = **+0,42** e Tempo × e_NPS = +0,38. **Quanto mais demora, mais satisfeito?** Não faz sentido de negócio.
- **Investigação:** separando por criticidade, **a relação se inverte**:

| Criticidade | Tempo × e_NPS | Tempo × RATINGS |
|---|---|---|
| Baixa | **−0,47** | **−0,51** |
| Média | **−0,51** | **−0,57** |
| Alta | **−0,38** | **−0,49** |

- **Explicação:** a **criticidade é uma variável omitida (confundidora)**. Chamados críticos **demoram mais** (H2) e **também recebem notas maiores** (H4). Misturando tudo, parece que "demorar é bom". **Dentro de cada nível, demorar sempre piora a satisfação.**
- **Hipótese:** **reduzir o tempo de resolução aumenta a satisfação em todos os níveis de criticidade.**
- **Ação:** o tempo de resolução é uma **alavanca real** de satisfação. Metas de redução por nível de criticidade.
- **Lição:** é o exemplo do slide "Variável Omitida" (QI × tempo de estudo × nota) acontecendo na base.

### H4: Chamados críticos geram mais satisfação (Criticidade × RATINGS +0,59; × e_NPS +0,53)
- **Leitura:** criticidade alta tem **e_NPS médio de 9,5 e RATINGS de 4,5**, contra **6,1 e 2,4** na baixa.
- **Hipóteses:**
  - chamados críticos são atendidos por **técnicos mais seniores**, com mais atenção e comunicação?
  - **efeito alívio**: resolver um problema grave gera gratidão?
  - chamados de baixa criticidade são **tratados com descaso** (fila longa, respostas-padrão)?
- **Como validar:** cruzar com o nível do técnico (N1, N2, N3), o número de interações e as atualizações ao colaborador por chamado.
- **Ação:** levar para os chamados simples as práticas de comunicação dos críticos. **A baixa criticidade é 52% do volume**, então é aí que está o maior ganho de satisfação.

### H5: O telefone é o canal de maior esforço (CES × Telefone +0,65; CES × Chat −0,48)
- **Leitura:** CES médio de **3,75 no telefone**, contra 2,55 no portal e 2,24 no chat. O telefone também tem o **pior e_NPS (5,9)** e o **pior RATINGS (2,4)**.
- **Hipótese:** o telefone exige **mais esforço** (espera na URA, transferências, repetir o problema)?
- **Cuidado: é o canal ou é a idade?** A idade também se correlaciona com o CES (+0,50). **Controlando pela faixa etária, o telefone continua pior:** CES de 3,7 a 3,9 no telefone contra 2,2 a 2,6 no chat e no portal, **em qualquer idade**. **O problema está no canal, não no colaborador.**
- **Como validar:** medir o tempo de espera, as transferências e a taxa de resolução no primeiro contato (FCR) do telefone.
- **Ação:** redesenhar a jornada telefônica (URA, callback, FCR) e oferecer o chat como alternativa **assistida**, com o **custo de produtividade** em mente: cada hora de chamado aberto é uma hora de colaborador parado.

### H6: A idade define o canal (Idade × Telefone +0,74; Idade × Chat −0,62)
- **Leitura:** a idade média é de **51 anos no telefone**, 37 no portal e 31 no chat. **83% dos colaboradors com 46 anos ou mais usam o telefone**, e 78% dos que têm até 30 usam o chat.
- **Hipótese:** os colaboradores mais velhos **preferem ou dependem do telefone**, e por isso **sofrem mais com o canal de maior esforço** (H5)?
- **Idade × CES (+0,50) provavelmente é espúria.** A idade não aumenta o esforço por si. Ela **leva ao telefone**, que é o canal de maior esforço (veja o controle na H5).
- **Risco:** **viés de seleção** nas pesquisas por canal, porque cada canal atende um público diferente.
- **Ação:** melhorar o telefone é **prioridade de inclusão**. Não force a migração digital. Crie opções assistidas (callback, atendimento humano direto).

### H7: Esforço destrói a satisfação (CES × RATINGS −0,54; CES × e_NPS −0,48)
- **Leitura:** quanto maior o esforço do colaborador, pior a nota e a recomendação.
- **Hipótese:** o **esforço é um fator de insatisfação independente da criticidade** (CES × Criticidade = 0,01)?
- **Ação:** adotar o **CES como KPI prioritário** e atacar os pontos de fricção (formulários, transferências, repetições).

---

## 4. Resumo executivo para a Diretoria de Suporte de TI

1. **Reduzir o tempo de resolução aumenta a satisfação em todos os níveis de criticidade (H3).** A correlação geral positiva é enganosa: é um **Paradoxo de Simpson** causado pela criticidade.
2. **O telefone é o canal problemático (H5).** Tem o maior esforço e a menor satisfação, **independentemente da idade**, e concentra o público de 46 anos ou mais (H6).
3. **Os chamados críticos demoram cerca de 10 vezes mais que os de baixa criticidade (H2).** É preciso verificar se há descumprimento de SLA.
4. **Os chamados simples são o maior potencial de ganho (H4):** são 52% do volume e têm a pior satisfação.
5. **Qualidade de dados:** 5 registros com idade 0. Recomenda-se validar o cadastro na origem.

> ⚠️ **Correlação não é causalidade.** Todas as hipóteses devem ser validadas com o dono do processo (*business owner*) e, quando possível, com testes controlados (A/B, pilotos).
