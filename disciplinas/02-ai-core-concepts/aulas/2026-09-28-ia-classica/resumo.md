# AI Core Concepts: Resumo da Aula (28/09/2026)

> Documento vivo, atualizado durante a aula com os slides e a transcrição.
> Transcrição completa: [transcricao_completa.md](<../../../../acervo-local/originais/Aulas/AI-Core-Concepts/02_Resumo_e_Transcricao/transcricao_completa.md>) · Slides: [prints da aula](../01_Material_da_Aula/prints_da_aula/)

---

## Sobre a disciplina *(extraído do PDF oficial: "Aula 1 - IA Clássica", 48 slides)*
**Professora:** Tassiana Rugoni de Campos. Coordenadora de MBA na FIAP, consultora de dados e professora há cerca de 20 anos, ex-Head of Data & Analytics na triggo.ai. [LinkedIn](https://www.linkedin.com/in/tassianarugoni) · proftassiana.campos@fiap.com.br

**Objetivos da disciplina:**
- Aperfeiçoar os conhecimentos sobre ambientes analíticos apoiados por IA.
- Conhecer casos de uso cujas oportunidades de negócio foram impulsionadas pelas IAs clássicas e generativas.
- Compreender os componentes arquiteturais que viabilizam soluções com **LLMs, NLP e IAGen**.
- Aplicar LLMs em bases de dados curadas para resolver problemas de negócio.

**Conteúdo programático:**
1. O cenário atual de IA (compreensão do mercado)
2. Tipos de aprendizado e soluções low-code
3. NLP, LLM e IA Generativa
4. Tokenização, embeddings, chunks e bancos de dados vetoriais
5. **RAG** (chats especialistas) e **GraphRAG** (agentes de IA)
6. Governança, vieses e aspectos éticos

**Metodologia:** aula expositiva, debates e **Hands On** de soluções IAGen. **Avaliação:** exercícios práticos durante as aulas.

**Referências:** LangChain (Introduction, LangGraph), Azure (RAG no AI Search), Foreman (*Data Smart*), Barbieri (*Governança de Dados*), Russell & Norvig (*IA: Uma Abordagem Moderna*), Géron (*Hands-On ML*), Chip Huyen (*Designing ML Systems*), *Practical MLOps*, entre outros. Todos estão em learning.oreilly.com.

**Objetivos desta aula:** conhecer a IA clássica, entender os tipos de ML, discutir casos e vieses e **aplicar a IA clássica por meio da correlação estatística**.

---

## Parte 1: Vieses em Análise de Dados

### 1. Viés de Seleção
**Slide:** 9 pessoas (3 mulheres e 6 homens) e sua fruta preferida. O quadrado vermelho seleciona só as 3 mulheres.

| | Uva | Banana |
|---|---|---|
| Amostra (só mulheres) | 2 (67%) | 1 (33%) |
| População (9 pessoas) | 3 (33%) | 6 (67%) |

- **Definição:** a amostra não representa a população porque o critério de escolha distorce o resultado.
- **Lição:** a conclusão se **inverte**, com "preferem uva" na amostra e "preferem banana" na realidade. Aumentar a amostra do mesmo jeito não resolve.
- **Em IA:** modelos treinados com dados enviesados reproduzem e ampliam o viés (crédito, reconhecimento facial, recrutamento).
- **Mitigação:** amostragem aleatória ou estratificada, comparar a amostra com a população, documentar a origem dos dados e reponderar.

### 2. Viés de Confirmação
**Slide:** diagrama de Venn com "O que dizem os fatos" e "O que confirma suas crenças".
- Fatos que **não** confirmam a crença → **subvalorizados**
- Interseção (fatos que confirmam a crença) → **sobrevalorizados**
- Crença sem apoio nos fatos → **insensato**

**Exemplo da professora:** o analista mostra com dados que a hipótese do gestor não se sustenta. O gestor pede para "filtrar" (usar só dados a partir de 2025, tirar certas variáveis) até a hipótese parecer verdadeira. É uma dor comum, ligada a pressões políticas e à necessidade do gestor de provar valor.

- **Definição:** buscar, filtrar ou interpretar dados para confirmar o que já se acredita.
- **Risco:** *p-hacking* ou *cherry picking*, com decisões baseadas em evidência fabricada.
- **Mitigação:** definir a hipótese e o recorte de dados **antes** da análise, registrar todas as análises feitas e ter revisão independente.

### 3. Viés de Variável Omitida
**Slide:** study time → points (+). O **QI** (variável omitida) afeta o tempo de estudo (−) e a pontuação (+).
*Fonte: estatsite.com.br/2020/11/11/tipos-de-vieses-em-analises-estatisticas/*

- **Definição:** uma variável relevante fica fora da análise e distorce a relação observada entre as outras.
- **No exemplo:** quem tem QI mais alto estuda menos e pontua mais. Sem considerar o QI, o efeito do tempo de estudo sobre a nota é **subestimado** e pode até parecer negativo.
- **Em IA:** o modelo atribui o efeito à variável errada (correlação espúria, *confounding*).
- **Mitigação:** conhecer o domínio, mapear as variáveis causais (diagramas causais), incluir *confounders* e usar experimentos controlados (A/B).
- **Exemplo da professora (ITA):** *"Estudar no ITA transforma o profissional em alguém de QI elevado?"* A variável omitida é o **vestibular**, que já é um **filtro**: quem entrou provavelmente já tinha QI elevado.
- **Ferramenta:** existem modelos que calculam a **importância de cada variável** (*feature importance*), atribuindo um percentual a cada campo da base para **não deixar nenhuma variável importante de fora**.

**Crenças limitantes (professora):** *"Temos muita dificuldade de acomodar informações novas."*
- Desvirar o chinelo, não passar embaixo de escada ("vai que…"). Essas não afetam nada.
- ⚠️ **Crença perigosa:** "é preciso esperar **48 horas** para registrar o desaparecimento de uma pessoa". Na verdade, **as primeiras horas são as mais estratégicas**, e a chance de sucesso cai drasticamente com a espera.
- **Microsoft:** foi na contramão do software livre e hoje **financia o open source**, porque a comunidade global lança soluções que nem big techs conseguem sozinhas. *"A Microsoft voltou atrás algumas vezes."*

---

## Parte 2: Resistência à Mudança de Modelos

### 4. Tentativas de negar a mudança de modelos
| Quem | Frase | Contexto |
|---|---|---|
| **Horace Rackham**, CEO do Michigan Savings Bank | "Cavalos sempre existirão, mas automóveis são um modismo e logo desaparecerão." | Conselho ao advogado de Henry Ford para não investir na indústria automotiva (1903) |
| **Decca Records** | "Bandas com guitarristas estão acabando." | Justificativa para recusar os Beatles (1962) |
| **Steve Ballmer**, CEO da Microsoft | "Não existe nenhuma chance do iPhone conquistar um market share significativo no mercado." | 2007 |

- **Mensagem:** líderes experientes e bem-sucedidos subestimam rupturas tecnológicas porque avaliam o novo com os critérios do modelo antigo.
- **Ligação com a Parte 1:** é o **viés de confirmação** aplicado à estratégia. Valorizamos os sinais de que o modelo atual continuará funcionando.
- **Para a liderança em IA:** a pergunta a fazer é "o que precisa ser verdade para isso mudar nosso negócio?", e não "a IA vai pegar?".

---

## Parte 3: Desafios e Riscos da IA

### 5. Enquete (Poll Everywhere): os 3 desafios mais críticos da IA
1. **Legislação:** falta de regulação e governança, ou regulação excessiva
2. **IA Geral:** IA assumindo o controle
3. **Déficits cognitivos:** IA reduzindo nosso aprendizado e pensamento crítico
4. **Vieses, discriminação algorítmica e falta de transparência dos modelos**
5. **Deepfake:** crimes cibernéticos facilitados pela IA *(destacado no slide)*
6. **Obsolescência humana:** substituição de humanos por máquinas
7. **Hype:** uso de IA como "bala de prata"

**🏆 Resultado da turma (34 votos), top 3:**
1. **Déficits cognitivos** (o 1º lugar coincidiu com o top 3 da professora)
2. **Legislação:** falta de regulação ou regulação excessiva. A professora também se preocupa com a regulação excessiva, *"escrita por quem não entende do tema, porque isso trava inovação"*.
3. **Deepfake**

> 💡 Meus 3 votos: ______

### 6. Caso real de deepfake: fraude de US$ 25 milhões (CNN Brasil, 04/02/2024)
**Manchete:** "Funcionário de multinacional paga US$ 25 mi a golpista que usou 'deepfake' para simular reunião"

- **O que aconteceu:** em Hong Kong, um funcionário do setor financeiro participou de uma videoconferência com o "CFO" e outros "colegas". **Todos os participantes eram deepfakes** (vídeo e voz gerados por IA). Seguindo as instruções, ele fez transferências que somaram cerca de US$ 25 milhões. Depois, a empresa foi identificada como a britânica Arup.
- **Por que funcionou:** a desconfiança inicial (o pedido chegou por e-mail) foi vencida pela "prova visual" da reunião com rostos e vozes conhecidos. É engenharia social potencializada por IA.
- **Lições para a liderança:**
  - Vídeo e voz **deixaram de ser prova de identidade**.
  - Criar processos de verificação fora do canal (ligar de volta para um número conhecido, palavra-código, dupla aprovação para transferências).
  - Treinar os funcionários, principalmente os de finanças e os executivos, que são os alvos preferenciais.
  - Governança: limites de valor, segregação de funções e controles que não dependam do "chefe pediu".

**O que a professora comentou:**
- Numa turma de MBA da PwC, os alunos reagiram: o deepfake foi o **gatilho**, mas não o único problema. *"Como é que você autoriza uma transação de 25 milhões de forma verbal numa reunião do Zoom?"* Movimentações financeiras passam por autorizações que vão além do verbal.
- Um colega levantou o peso da **hierarquia**: quem foi clonado era um executivo sênior, e é difícil questionar "o chefe".
- **Conclusão:** a falha foi **tecnológica (deepfake) e de processo e governança** ao mesmo tempo.

### 7. Reconhecimento facial: quando o viés vira dano real
**Slide:** imagem de mapeamento facial ("PROCESSING") e manchete da StartSe (08/07/2019): "Reconhecimento facial utilizado pela polícia inglesa falha em 81% dos casos".

- **O caso:** um estudo independente da Universidade de Essex analisou os testes de reconhecimento facial ao vivo da Polícia Metropolitana de Londres. Das 42 pessoas que o sistema apontou como procuradas, só 8 foram confirmadas como corretas. Ou seja, cerca de **81% dos alertas eram falsos positivos**.
- **Por que acontece:**
  - **Viés de seleção nos dados de treino:** bases pouco diversas fazem os erros se concentrarem em mulheres, pessoas negras e outros grupos pouco representados.
  - Condições reais (luz, ângulo, multidão) são diferentes das do laboratório.
  - Listas de "procurados" desatualizadas.
- **Impacto:** pessoas inocentes abordadas pela polícia. É **discriminação algorítmica** (item 4 da enquete) com consequência direta sobre direitos civis.
- **Lições para a liderança:**
  - Acurácia de laboratório ≠ desempenho em produção. Meça falsos positivos e falsos negativos **por grupo**.
  - Em decisões de alto impacto, mantenha um **humano no processo** (*human-in-the-loop*).
  - Transparência e auditoria independente antes de usar em escala. A regulação, como o AI Act europeu, trata esses sistemas como alto risco.
- **Ligação com a Parte 1:** é o viés de seleção (dados) somado ao viés de confirmação (confiar no "match" da máquina).

**O que a professora comentou:**
- **Resistência social:** houve protestos no mundo todo quando o reconhecimento facial começou. Em **Hong Kong**, manifestantes usaram máscaras e óculos para não serem identificados. Hoje a tecnologia está mais "assentada", e São Paulo e várias cidades brasileiras já usam sistemas desse tipo.
- A polícia inglesa **precisou tirar o sistema do ar** (2019).
- **A "guerra estatística":** em vez de divulgar os 81% de falhas, dá para divulgar só as taxas de falso positivo e de falso negativo e **mascarar a informação**. É o viés de confirmação de novo, agora na comunicação dos resultados.

#### 🧮 Conceito-chave: Matriz de Confusão
Além dos acertos, olhamos os **tipos de erro**:

| | Realmente procurado | Realmente inocente |
|---|---|---|
| **Sistema diz "é procurado"** | ✅ Verdadeiro Positivo | ❌ **Falso Positivo** |
| **Sistema diz "não é"** | ❌ **Falso Negativo** | ✅ Verdadeiro Negativo |

- **Falso positivo** = um inocente tratado como criminoso.
- **Falso negativo** = um procurado que passa sem ser detectado.

**Debate da turma: qual erro é pior?** A maioria respondeu *falso positivo*. O Otávio lembrou que **"depende do contexto"**. Aqui, o falso positivo era o grande problema do modelo: inocentes eram abordados a todo instante na rotina, o que gerou revolta.
**Complemento da professora:**
- *Do ponto de vista da segurança pública, o falso negativo é assustador* (um bandido passar). Mas, para a população em geral, ser inocente e acusado a todo instante também é muito grave.
- Pode ter havido **outras features que estereotipavam** pessoas com certas características. Isso não foi divulgado.
- **Métricas:** para decidir se um modelo "vai para o ar", é preciso um **painel completo de métricas** (acurácia, precisão, FP, FN…), e não um número isolado escolhido a dedo.
- **Ataques adversariais (comentário do Júlio no chat):** um designer de moda criou uma **estampa de camiseta que deixa a pessoa "invisível"** para o algoritmo de reconhecimento. Antes, até uma posição específica da mão enganava o modelo. Os modelos melhoram, mas **ainda existem essas brechas**.

> 💡 **Para líderes:** a escolha entre minimizar FP ou FN é uma **decisão de negócio e de ética**, não só técnica. Num diagnóstico de câncer, o FN (não detectar a doença) costuma ser pior. Numa abordagem policial, o FP (acusar um inocente) costuma ser pior.

### 8. "Esta Pessoa Não Existe": rostos gerados por IA
**Slide:** site [this-person-does-not-exist.com/pt](https://this-person-does-not-exist.com/pt), um gerador de faces aleatórias. A cada clique aparece o rosto realista de alguém que **não existe** (homem, mulher ou criança).

- **Tecnologia:** **GANs** (*Generative Adversarial Networks*), em especial o StyleGAN da NVIDIA. Duas redes competem: o **gerador** cria imagens falsas e o **discriminador** tenta distinguir as falsas das reais. Com o treino, o gerador fica tão bom que o discriminador (e o olho humano) não conseguem mais diferenciar.
- **Usos legítimos:** fotos de banco de imagens sem direitos de imagem, personagens de jogos, dados sintéticos para treinar modelos preservando a privacidade.
- **Riscos:** perfis falsos em redes sociais e no LinkedIn, golpes de romance, bots e desinformação, fraude de identidade (KYC). É a base técnica dos **deepfakes** (item 6).
- **Sinais de rosto gerado (cada vez mais raros):** fundo distorcido, brincos assimétricos, dentes e cabelo irregulares, pessoas "cortadas" nas bordas (como a figura à direita no slide).
- **Lição:** assim como vídeo e voz, **uma foto não prova mais que a pessoa existe**.

---

## Apêndice: GANs (Redes Adversariais Generativas)

### 9. Arquitetura de uma GAN
*Fonte: medium.com/@marcodelpra/generative-adversarial-networks-dba10e1b4424*

```
                 ┌──────── Atualiza o Gerador ◄─────────────┐
                 ▼                                          │
[Vetor aleatório] → [GERADOR] → [Exemplo falso] ─┐          │
                                                 ├→ [DISCRIMINADOR] → [Classificação: Real/Falso]
                            [Exemplo real] ──────┘         ▲                  │
                                                           └── Atualiza o ◄───┘
                                                               Discriminador
```

| Componente | Papel | Analogia |
|---|---|---|
| **Vetor de entrada aleatório** (*random input vector*) | "Semente" de ruído. Cada vetor diferente gera uma imagem diferente | A inspiração do falsificador |
| **Gerador** (*Generator Model*) | Transforma o ruído num exemplo falso (ex.: um rosto) | **Falsificador** de notas |
| **Exemplo real** (*Real Example*) | Amostras verdadeiras do conjunto de treino | Notas verdadeiras |
| **Discriminador** (*Discriminator Model*) | Recebe exemplos reais e falsos e tenta distinguir um do outro | **Perito / polícia** |
| **Classificação binária** (Real/Falso) | Saída do discriminador, usada para calcular o erro dos dois | O veredito do perito |

**Como o treinamento funciona (o "jogo adversarial"):**
1. O gerador cria falsos a partir de ruído.
2. O discriminador classifica os reais e os falsos. Quando erra, **ele é atualizado** (seta de baixo) para ficar mais exigente.
3. Quando o discriminador pega o falso, **o gerador é atualizado** (seta de cima) para enganar melhor.
4. O ciclo se repete até o equilíbrio: o discriminador **não consegue mais distinguir** e fica em cerca de 50%, como no chute. Nesse ponto o gerador produz exemplos indistinguíveis dos reais, como no site "Esta Pessoa Não Existe".

**Como a professora explicou:**
- Mostrou o site ao vivo. **No começo, as imagens tinham falhas** (orelha deslocada, cabelo "recortado"). Hoje parecem cada vez mais reais, e o site até tem **filtros** para escolher características.
- São **dois modelos de deep learning** (aprendizado profundo). Para **dados não estruturados** (imagem, áudio, vídeo) usamos algoritmos mais complexos, como o deep learning.
- O discriminador é um **classificador binário**: 0 ou 1, real ou fake.
- *"O modelo só é considerado bom se o discriminador erra pelo menos 50% das vezes"*, ou seja, quando não consegue mais distinguir o real do falso.
- Lembrete histórico: fala-se de IA **desde a década de 1950, com Turing, o pai da computação**. Não é um assunto novo.

**Pontos-chave para a prova e para o negócio:**
- Proposta de **Ian Goodfellow (2014)**. É aprendizado **não supervisionado**: não precisa de rótulos, só dos dados reais.
- **Aplicações:** rostos sintéticos (StyleGAN), deepfakes, aumento de dados (*data augmentation*), super-resolução de imagens, arte e design, dados sintéticos para privacidade.
- **Evolução:** hoje os **modelos de difusão** (Stable Diffusion, Midjourney, DALL·E) dominaram a geração de imagens, mas a lógica de "gerar e avaliar" continua central na IA generativa.
- **Ligação com a aula:** a mesma técnica que cria dados sintéticos úteis cria os deepfakes do caso dos US$ 25 milhões. **A tecnologia é neutra; o uso e a governança definem o impacto.**

---

## Parte 4: Máquinas Pensam? Linguagem Humana

### 10. "Máquinas são capazes de pensar? Elas compreendem a linguagem humana?"
**Slide:** uma mão robótica e uma mão humana brindando com taças de vinho, uma metáfora da convivência entre humanos e máquinas.

**Contexto para estudo:**
- **Alan Turing (1950)**, no artigo *"Computing Machinery and Intelligence"*, trocou a pergunta "máquinas pensam?" por uma pergunta testável: **o Jogo da Imitação (Teste de Turing)**. Se um avaliador humano, conversando por texto, não consegue distinguir a máquina de um humano, a máquina "passa" no teste.
- **Contraponto: o Quarto Chinês de John Searle (1980).** Uma pessoa que não fala chinês segue um manual de regras e devolve respostas perfeitas em chinês sem entender nada. É a diferença entre **manipular símbolos (sintaxe)** e **compreender significado (semântica)**.
- **LLMs hoje** (ChatGPT, Claude, Gemini): geram linguagem prevendo o próximo *token* com base em padrões aprendidos de enormes volumes de texto. Eles **passam em versões do Teste de Turing**, mas o debate continua: há compreensão ou só uma imitação estatística muito sofisticada?
- **Ligação com a aula:** assim como as GANs geram rostos que "parecem reais", os LLMs geram textos que "parecem compreensão". Imitar bem não é o mesmo que entender, e isso importa para confiança, alucinações e responsabilidade.

**O que a professora comentou:**
- *"Se até o modelo (o discriminador) está errando, quem dirá a gente."* Está cada vez mais difícil distinguir o fake do real, inclusive como pessoa física, com muitos golpes usando nossas imagens.
- **Dica prática:** não deixe o entregador tirar foto do seu rosto "para confirmar a entrega".
- **"Somos uma bolha tech":** muita gente não entende como a tecnologia funciona e está sendo enganada.
- A enquete teve 34 votos (o resultado será mostrado depois).
- **A turma respondeu à pergunta do slide com "sim" e "ainda não".** *"Há 4 ou 5 anos os alunos achavam essa pergunta ridícula. Hoje já ouço alguns 'sims'."* Estamos ultrapassando fronteiras.
- **Discussão filosófica sobre a AGI:** *"Se a gente começar a definir o que é pensar, talvez a pergunta não pareça tão absurda."*
- **IA senciente e AGI já aparecem no Hype Cycle da Gartner.** O debate passou a ser legítimo.

### 11. Teste de Turing
**Slide:** o diagrama clássico e a tirinha *"Turing Test 2208"* (geek and poke).

**Como funciona (diagrama):**
```
   A (máquina)        B (humano)
   ─────────────────────────────  ← barreira: C não vê A nem B
            C (interrogador)
     "Quem é o humano? Quem é a máquina?"
```
- **C**, o avaliador humano, conversa **só por texto** com **A** (um computador) e **B** (uma pessoa), sem ver nenhum dos dois.
- A máquina tenta se passar por humana, e o humano tenta provar que é humano.
- Se C **não consegue identificar** com segurança qual é a máquina, ela **passa no teste**.
- Turing propôs o teste em 1950 como *"Jogo da Imitação"*. Ele evita definir o que é "pensar" e mede só o **comportamento observável**.

**A tirinha "Turing Test 2208":**
> — Ontem eu fiz um Teste de Turing.
> — Interessante! Qual foi o resultado?
> — Eu falhei! A máquina percebeu na hora que era eu o humano burro.
> — *(robô)* Coragem!

**Na fala da professora:** para Turing, se alguém observando uma conversa **não conseguisse distinguir quem é humano e quem é máquina**, teríamos alcançado a inteligência de máquina (a professora associou isso à AGI). *"O teste de Turing já não serve mais pra nada. Com todo respeito ao Turing."*

**A ironia:** no futuro, os papéis se invertem. Quem precisa "provar" alguma coisa é o humano, e a máquina é que avalia e reconhece o humano como o "menos inteligente".

**Críticas e atualidade:**
- O teste mede **imitação**, não compreensão (veja o Quarto Chinês, item 10). Uma máquina pode enganar sem "pensar".
- Humanos são fáceis de enganar: o chatbot **ELIZA (1966)** já convencia algumas pessoas com regras simples.
- **LLMs modernos** passam em versões do teste com frequência, o que fez o debate migrar de "a máquina parece humana?" para "a máquina é **confiável, correta e segura**?".
- Na prática, hoje fazemos o **Teste de Turing ao contrário** o tempo todo: os **CAPTCHAs** ("prove que você não é um robô") pedem que o humano prove que é humano, como na tirinha.
- **Para líderes:** isso se conecta aos deepfakes (item 6). Se não conseguimos distinguir humano de máquina, precisamos de **processos de verificação**, transparência ("você está falando com uma IA") e regulação.

### 12. Caso Google LaMDA: "a IA tem consciência"? (CNN Brasil / Reuters, 23/07/2022)
**Manchete:** "Google demite engenheiro por dizer que inteligência artificial tinha consciência"

- **O caso:** **Blake Lemoine**, engenheiro do Google que testava o chatbot **LaMDA** (*Language Model for Dialogue Applications*), disse ao *Washington Post* que o sistema teria alcançado **consciência (senciência)** depois de centenas de conversas. O LaMDA dizia ter sentimentos e medo de ser desligado.
- **Resposta do Google:** negou a afirmação e disse que ela não tinha fundamento, depois de revisões internas. Lemoine foi afastado e depois **demitido** por violar políticas de confidencialidade (publicou as conversas).
- **Visão dominante dos especialistas:** o LaMDA era um modelo de linguagem que **previa as palavras mais prováveis**, treinado com textos humanos, que estão cheios de falas sobre sentimentos. Ele **imitava** a linguagem da consciência sem evidência de tê-la.
- **Ligação com os itens 10 e 11:** o LaMDA "passou" num Teste de Turing informal com um especialista, o que mostra o **limite do teste**. Parecer humano não prova que há pensamento ou consciência. É o Quarto Chinês na prática.
- **Efeito ELIZA / antropomorfização:** tendemos a atribuir mente e emoções a sistemas que conversam bem. É mais um **viés cognitivo**, ligado à Parte 1.
- **Contexto:** poucos meses depois (nov/2022) veio o **ChatGPT**, e esse debate chegou ao público em geral.

**Na fala da professora:** o engenheiro fez a declaração pública na primeira vez que viu o LLM do Google em ação e foi demitido, *"porque não tinha noção das complicações éticas da declaração"*. *"Me foi chocante, lembro como se fosse hoje."* Ela comentou que ainda não era o Gemini, mas uma versão anterior. (Para a prova: o nome era **LaMDA**.)

**Lições para a liderança:**
- **Governança e comunicação:** a empresa precisa de política clara sobre o que funcionários podem dizer e publicar sobre sistemas internos de IA.
- **Expectativas realistas:** evitar o *hype* (item 7 da enquete) e o alarmismo. Os LLMs são ferramentas poderosas de linguagem, não seres conscientes.
- **Risco para usuários:** pessoas podem criar vínculo emocional com chatbots ou confiar demais neles. Isso exige transparência e design responsável.

---

## Parte 5: Discussão em Turma: Antropomorfização, Squads Híbridas e Agentes

### Antropomorfização da IA
**Definição:** colocar a IA **no mesmo patamar de um humano** (dar nome, cargo, personalidade).

**Caso do banco (cliente da professora):** num treinamento de GenAI para times técnicos (agentes, orquestração, multiagentes), um agente se chamava **"Analista Financeiro 1"**. O banco exigiu **refazer todo o material**: *"sob hipótese alguma podemos chamar um agente de IA com o título de um cargo"*. O nome passou a ser algo como "agente auxiliar".
- **Não há gabarito.** O mercado está dividido:
  - **A favor de nomes humanos:** ajuda a criar uma cultura agêntica (como foi com o *data driven*), "quebra o gelo" e aproxima as pessoas.
  - **Contra:** é um erro ético grave. Se esquecermos que o agente é **código que erra**, vamos tirar o humano do loop e os guardrails.
- **Risco extremo:** adolescentes que "se consultam" com IA, com casos de suicídio. Tratar a IA como humana tem implicações muito delicadas.

**Contribuições da turma:**
- **Júlio:** "Então qual nome usar?" Um nome que descaracterize o humano, como "agente auxiliar".
- **Colega:** *"Humanos também erram."* A máquina tem cálculo probabilístico mais assertivo. O modelo ideal é o **copiloto**: o humano à frente e o agente trazendo informação para a decisão. A professora concordou que essa é a visão defendida no mercado.
- **Peter:** o ponto central é a **responsabilização** (*accountability*). Quem responde pelo erro do agente?

### Caso dos "200 agentes em 3 meses"
- Uma empresa pediu **200 agentes em 3 meses**, um "número mágico" sem fundamento.
- Resultado: **200 PoCs, alguns MVPs e nenhum ROI comprovado**.
- A empresa deu passos para trás e agora está fazendo **letramento em IA e arquitetura**, com visão clara de objetivos, **guardrails**, **humano no loop** e **FinOps** (custo de tokens que faça sentido).
- *"Já passou a era da galera se gabando porque acabou com a cota de tokens do dia."* Agora a conversa é sobre **ROI**.

### Todo mundo precisa saber fazer IA? (Aline)
- Um presidente de empresa procurava um **analista financeiro sênior para orquestrar dezenas de agentes de IA** administrativo-financeiros. A pessoa precisaria ser especialista no negócio **e** em IA.
- **Pergunta:** se todos os cargos tiverem que se aprofundar em IA, as pessoas **vão perder o foco da sua especialidade**? Todo mundo quer "fazer dentro de casa", e vira um "samba do crioulo doido".
- **Professora:** talvez o caminho seja **entender a IA para se posicionar e estabelecer limites**. Usar **copilotos e low-code** para ter eficiência pessoal, mas **grandes implementações corporativas continuam com times de desenvolvimento**, que podem até ser terceirizados.

### "A IA é um tsunami" (Peter)
- Alguns vão surfar e a maioria vai ser atropelada. Estamos num momento de **FOMO** e transição.
- **Analogia da datilografia:** o datilógrafo deixou de existir porque todo mundo passou a digitar sem se achar "datilógrafo". A IA vai ficar natural do mesmo jeito.
- **Pressão comercial:** fornecedores empurram "tenha 32 agentes", porque **cada agente é token e receita para eles**. Do outro lado, as pessoas ainda precisam fechar o mês.
- **Recomendação:**
  - Fazer o **Pareto** e uma **SWOT** do que vale ou não levar para a IA.
  - **"Pegue UM agente e faça funcionar. Depois vá para o segundo."**

### Hype e o custo humano
- **Final de 2023:** empresas procuravam consultorias desesperadas para "implementar IA" porque estava no roadmap, sem saber **por quê nem para quê**. *"Foi rico financeiramente, mas assustador."* Ainda estamos no hype, usando a IA como **bala de prata** (item 7 da enquete).
- **Otávio:** um gerente pediu demissão porque perdeu os desenvolvedores e passou a cuidar de **agentes desenvolvedores**. A **carga cognitiva e o estresse** o fizeram desistir.
- **Engenheiros de software (outra turma):** *"Antes levávamos 4 horas para codar. Agora codamos em 30 minutos e levamos 8 horas para entender o que a IA fez"*: código verboso, que não segue os padrões de design da organização.

> 💡 **Lições para líderes:** comece pequeno e prove valor (ROI) antes de escalar. Não trate a IA como humana (nome, cargo), mantenha o humano no loop com guardrails e defina quem é responsável. Meça também o **custo cognitivo** para as pessoas, não só a eficiência.

---

## Parte 6: Riscos Cognitivos

### 13. "Uso de IA reduz o aprendizado e o pensamento crítico"
**Slide:** mapas de conectividade cerebral (EEG, banda Alfa) comparando três grupos: **LLM**, **Search** e **Brain**.
- **Grupo 1:** usou o **ChatGPT** para gerar os textos
- **Grupo 2:** usou o **Google** para pesquisar informações
- **Grupo 3:** escreveu os textos **sem qualquer apoio** (só o cérebro)

**O estudo** (para referência): *"Your Brain on ChatGPT: Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing"*, do **MIT Media Lab** (Nataliya Kosmyna et al., 2025). Participantes escreveram redações ao longo de várias sessões enquanto a atividade cerebral era medida por **EEG**.

**Principais achados:**
- **Conectividade cerebral:** foi maior no grupo *Brain-only*, intermediária no grupo *Search* e **mais fraca no grupo LLM**. Quanto mais apoio externo, menor o engajamento neural.
- **Memória:** a maioria dos usuários de ChatGPT **não conseguia citar trechos da própria redação** minutos depois de escrevê-la.
- **Senso de autoria:** o grupo LLM sentia menos que o texto era "seu".
- **Textos homogêneos:** as redações do grupo LLM eram muito parecidas entre si.
- **"Dívida cognitiva"** (*cognitive debt*): quem passou do LLM para escrever sem apoio mostrou engajamento reduzido. O "atalho" deixa um custo acumulado.
- **Ressalvas:** amostra pequena, estudo ainda em pré-publicação (*preprint*), sem revisão por pares na época. O estudo **não prova** que a IA "deixa as pessoas burras".

**Ligação com a aula:**
- É o item 3 da enquete, **Déficits Cognitivos**.
- Conecta com o relato dos engenheiros que "codam em 30 min e levam 8 h para entender": delegar sem entender gera dívida.

**O que a professora comentou:**
- **Está no top 3 dela** entre os desafios da enquete: *"O quanto a IA vem reduzindo o nosso aprendizado e o nosso pensamento crítico."*
- O grupo sem apoio teve atividade muito maior no **processamento semântico** e no **controle executivo**. *"O cérebro vai desligando à medida que você recebe mais suporte, até o ponto do LLM escrever para você a partir de um prompt."*
- Quem escreveu com o LLM teve **muita dificuldade de defender a própria redação**. *"Vemos isso nas reuniões: PPTs fantásticos e pessoas se perdendo para explicar os números."*
- **Escolas:** os filhos dela aprenderam técnicas de prompt para **a IA fazer sem parecer que fez**. *"Achei fantástico do ponto de vista de inteligência."*
- **Autocrítica docente:** o professor também precisa **desafiar os alunos a irem além do que um LLM entrega**.
- **A máquina é ótima em hard skills, mas "não tem alma".** Percepção, sentir e *feeling* (soft skills) são inteligências que a IA ainda não tem e que nos diferenciam.
- **Pergunta de um aluno de outra turma:** *"Será que não há outras áreas do cérebro, não monitoradas, que passaram a acender?"*

**Contribuições da turma:**
- **Colega de tecnologia:** a meta da empresa é **100% do código gerado por agentes de IA**. O problema é que alguns programadores só dão o prompt e **não revisam**. Como um programador não compete mais em tempo com ferramentas como o Claude Code, a chave é o **gerenciamento de pessoas**: educar para usar a IA **como ferramenta, não como substituição**. A professora completou que o programador vira **engenheiro e orquestrador**, que pensa a solução e desenha as boas práticas, e deixa de ser "codador".
- **Peter:**
  - A programação passa pela **mesma automação da indústria automobilística**: antes 30 pessoas faziam um carro, hoje 4 fazem 100. Mas *"alguém tem que saber o torque do parafuso, não necessariamente ter força para apertá-lo"*. Responsável: **accountability**.
  - **Ensino e tecnologia:** com a internet vieram os trabalhos copiados da Wikipedia. Os gregos temiam que a escrita acabasse com a memória. **Toda tecnologia de transição muda o aprendizado, e nos adaptamos.** *"Ninguém sabe mais fazer fogo, e tudo bem."*
  - O essencial é o **conhecimento crítico**: *"saber que eu não devo transferir 25 milhões numa reunião, mesmo para o CEO"*. Com procedimento, não importa se é IA ou não.
  - Os modelos atuais (citou o Fable) já escrevem **"igual a mim"** a partir de 5 e-mails. *"Tem coisa que eu não sei se fui eu que escrevi."*
  - **Sobre o método do estudo:** outras pesquisas questionam se **medimos certo**. Mais oxigenação no neurônio não quer dizer necessariamente mais funcionamento. *"Será que o cérebro desligou ou só não estamos olhando para o lugar certo?"*
- **Professora, fazendo o "advogado do diabo":** já vivemos outras revoluções (Revolução Industrial, calculadora), **mas agora está muito mais rápido**. *"A velocidade é o ponto que me preocupa."*
- **Como treinar os juniores?** Uma empresa **cortou o acesso dos juniores a LLMs** no ambiente corporativo para "não emburrecerem". É radical, mas é real. *"Como treinamos os juniores se a IA está fazendo justamente o papel deles?"*
- **Wesley:**
  - A IA potencializa e acelera, mas **não se pode só aceitar o que ela devolve**. *"Se ela produz e eu só aprovo o PR, está errado. A inteligência cognitiva ainda está com a gente."* É isso que permite reagir em incidentes e crises.
  - Segundo uma apresentação do **Gartner**, quem passou pela transição e **sabe fazer sem IA** será o profissional **valioso do futuro**. As entrevistas deveriam perguntar se a pessoa **sabe fazer sem a IA**, e não só com ela.
  - A professora concordou: temos uma **capacidade crítica** que as próximas gerações, nativas em IA, talvez não tenham.

> 💡 **Para líderes e para estudar:** use a IA como **copiloto, não como piloto**. Pense primeiro e use a IA para revisar e ampliar, não para substituir o raciocínio. Em times, incentive o entendimento e a revisão crítica do que a IA produz, principalmente na formação de profissionais juniores.

---

## Parte 7: Inteligência Artificial Clássica
**Slide de abertura da seção.** Aqui a aula passa das discussões de impacto para os **fundamentos técnicos**.

**Contexto para estudo (a confirmar com os próximos slides):**
- A **IA clássica** é também chamada de **IA simbólica** ou *GOFAI* (*Good Old-Fashioned AI*), dominante dos anos 1950 aos 1980.
- **Ideia central:** a inteligência vem de **regras explícitas e lógica** escritas por humanos (*se… então…*), e não de aprender com dados.
- **Marcos:** a Conferência de **Dartmouth (1956)**, onde John McCarthy cunhou o termo "Inteligência Artificial"; os sistemas especialistas (ex.: MYCIN, anos 1970); o **Deep Blue** vencendo Kasparov no xadrez (1997).
- **Contraste com a IA moderna:** o **Machine Learning / Deep Learning** aprende padrões com os dados em vez de receber regras prontas.

### 15. "Rede Neural é coisa séria?!": Quick, Draw! (Rápido, Desenhe!)
**Slide:** logo do jogo do Google, com o link [quickdraw.withgoogle.com](https://quickdraw.withgoogle.com/).

- **O que é:** um jogo do Google (2016). O jogo pede um objeto (bicicleta, pizza, caneca…), você tem **20 segundos para desenhar** e uma **rede neural tenta adivinhar** o que é enquanto você desenha.
- **Como funciona:** uma rede neural treinada com milhões de rabiscos. Ela reconhece o **padrão dos traços**, não um desenho perfeito. É **classificação de imagens** com **aprendizado supervisionado** (cada desenho tem um rótulo).
- **O efeito "flywheel" de dados:** cada partida vira dado de treino. O Google publicou o **Quick, Draw! Dataset**, com mais de **50 milhões de desenhos em 345 categorias**, usado em pesquisa até hoje.
- **Por que está na aula:** mostra de forma lúdica a diferença para a IA clássica (Parte 7). **Ninguém programou uma regra do tipo "bicicleta = dois círculos + triângulo"**. A rede **aprendeu com exemplos**.
- **Ligação com vieses (Parte 1):** o modelo reconhece melhor o jeito "mais comum" de desenhar. Desenhos de culturas diferentes (um tipo de casa ou de sapato, por exemplo) podem ser menos reconhecidos, o que é **viés de seleção** nos dados.
- **Para testar:** jogue algumas rodadas e observe em que momento a rede "entende" o desenho, e quando ela erra.

**Demonstração da professora (ao vivo):**
- *"É algo muito profissional. Se falarem alguma coisa diferente disso, eu nego."* 😄
- Ela desenhou uma flor. A rede arriscou "nariz", "iluminação de lua"… até dizer **"Já sei, é flor!"**. **Quando o nível de acurácia sobe o suficiente, a rede responde e passa para o próximo desenho.**
- A rede não adivinhou a luminária.
- **Como a rede concluiu que era um rato:**
  1. **Aprendizado supervisionado:** há uma **base de ratos desenhados por outras pessoas**, cada um com o rótulo (*label*) "rato".
  2. **Busca por semelhança:** a rede **sobrepõe o traçado** ao dos desenhos da base. O rato teve o maior *match*, com acurácia altíssima. Em segundo e terceiro lugar vieram um **crocodilo** e um **sapo**, que também tinham traços parecidos.

- **Retreino contínuo:** *"O meu rato entrou para a base de dados. O modelo ficou mais inteligente com o meu desenho."* Da próxima vez, ele acerta desenhos parecidos mais rápido.

**Analogia da professora: o hipopótamo 🦛**
> Posso dizer ao meu filho que o hipopótamo é grande e cinza, ou posso levá-lo ao zoológico e mostrar: *"olha, o hipopótamo está aqui"*. Ele vê todas as nuances. No dia seguinte, se eu mostrar um **hipopótamo rosa**, ele diz: *"a cor está diferente, mas é um hipopótamo"*.

**Definição (professora):** **aprendizado supervisionado** é olhar para o passado (uma base de dados **rotulada**) para projetar o futuro e reconhecer algo novo com base no que já existe. A base vira a **referência** para a IA fazer suas **inferências**.

**Os 3 tipos de aprendizado**, que a professora vai usar ao longo do curso:
| Tipo | Ideia | Exemplo |
|---|---|---|
| **Supervisionado** | Aprende com exemplos **rotulados** (entrada → resposta certa) | Quick, Draw!, detecção de fraude, previsão de churn |
| **Não supervisionado** | Encontra **padrões e grupos** em dados **sem rótulo** | Segmentação de clientes, detecção de anomalias |
| **Por reforço** | Aprende por **tentativa e erro**, com **recompensas e punições** | Jogos (AlphaGo), robótica, carros autônomos |

### 16. Programação Tradicional × Aprendizado de Máquina
**Slide:**
```
PROGRAMAÇÃO TRADICIONAL:  Dados de Entrada → Algoritmo    → Dados de Saída
APRENDIZADO DE MÁQUINA:   Dados de Saída   → Algoritmo ML → Modelo
```

**A virada de paradigma:**
- **Programação tradicional (IA clássica / regras):** o **humano escreve o algoritmo**, ou seja, as regras. O computador aplica as regras aos dados de entrada e produz a saída.
  - *Ex.:* "se o valor da transação > R$ 10 mil **e** o país é diferente do habitual → marcar como fraude".
- **Aprendizado de máquina:** o humano fornece **exemplos com as respostas** (dados **históricos** com os resultados, ou seja, os "dados de saída" / rótulos). O **algoritmo de ML descobre as regras sozinho** e o resultado é um **modelo**.
  - *Ex.:* mostrar milhões de transações já marcadas como "fraude" ou "legítima". O modelo aprende os padrões e depois classifica transações novas.
- **Depois**, o modelo é usado como um "algoritmo aprendido": **novos dados de entrada → Modelo → previsão**.

**Explicação da professora: "o ML começa pelo fim"** (exemplo de detecção de fraude)
- **Programação tradicional:** cria uma **"malha fina"**, um conjunto de *if-else*:
  - ticket muito acima do padrão do cliente ou do estabelecimento → suspeita;
  - mais de 5 tentativas de senha → suspeita;
  - IP muito distante da localidade → suspeita.
- **O problema:** a malha é **frágil e engessada**. Encadear todas as condições é muito complexo, e *"somos muito criativos, para o bem e para o mal"*: **todo dia surge uma configuração nova de fraude**.
- **Machine learning:** **começa pelo fim**, pela base histórica já **rotulada** ("fraude" / "não fraude"). O algoritmo **não recebe condicionais**. Ele olha os dados de saída, entende o comportamento com todas as nuances e cria uma malha de decisão **muito mais complexa**.
- **Retreino:** uma fraude inédita **passa uma única vez**. Depois que é rotulada e o modelo é retreinado, ela deixa de ser inédita e passa a ser detectada.
- 📌 **~80% do que se faz em IA hoje é aprendizado supervisionado**, inclusive a IA generativa. Segundo a professora, **os LLMs também são supervisionados**. (Para a prova: tecnicamente, o pré-treino dos LLMs é chamado de **autossupervisionado**, porque o próprio texto fornece o "rótulo", a próxima palavra, e o ajuste fino usa supervisão e reforço com feedback humano, o RLHF.)

**Por que isso importa:**
| | Programação Tradicional | Machine Learning |
|---|---|---|
| Quem cria as regras | Humano (especialista) | Algoritmo, a partir dos dados |
| Funciona bem quando | As regras são claras e estáveis (cálculo de imposto, folha de pagamento) | As regras são complexas ou difíceis de explicar (reconhecer imagens, voz, fraude) |
| Ponto fraco | Não escala para problemas com muitas nuances | Depende da **qualidade dos dados** (vieses da Parte 1!) e é menos explicável |
| Resultado | Determinístico | **Probabilístico** (acurácia, FP/FN, veja o item 7) |

- **Ligação com o Quick, Draw! (item 15):** ninguém escreveu a regra "rato = corpo oval + rabo + orelhas redondas". A rede recebeu **desenhos com o rótulo "rato"** e **gerou o modelo**.
- **Para líderes:** em ML, **os dados são o novo código**. Vieses nos dados viram vieses no modelo, e por isso governança de dados é governança de IA.

### 17. Aprendizado Supervisionado com Imagens: lobe.ai
**Slide:** tela do **Lobe** (Microsoft) com três exemplos de classificação de imagens:
| Imagem | Rótulo (label) | Acerto do modelo |
|---|---|---|
| Cacho de bananas | **banana** | **100% correct** |
| Pessoa sem máscara (webcam) | **sem máscara** | **71% correct** |
| Pessoa tomando café (xícara no rosto) | *(parcial no slide)* | **68% correct** |

**O que é o Lobe:** um aplicativo gratuito da Microsoft, **no-code**, para treinar modelos de **classificação de imagens**:
1. **Rotular:** você importa ou tira fotos pela webcam e dá o **label** de cada uma ("banana", "com máscara", "sem máscara").
2. **Treinar:** o Lobe treina automaticamente uma rede neural (usando *transfer learning* sobre um modelo pré-treinado).
3. **Testar:** ele mostra o **percentual de acerto** por classe e permite corrigir os erros, o que gera novos exemplos.
4. **Exportar:** o modelo pode ser exportado para apps (TensorFlow, ONNX, CoreML…).
> ⚠️ A Microsoft **descontinuou o Lobe** (não recebe mais atualizações), mas ele continua ótimo para aprender o conceito. Alternativas atuais: **Google Teachable Machine**, Azure Custom Vision, AWS Rekognition Custom Labels.

**O que o slide ensina:**
- É o **fluxo de ML do item 16** na prática: **exemplos rotulados → algoritmo ML → modelo**.
- **Por que a acurácia varia (100% × 71% × 68%):**
  - **Banana** é um objeto com forma e cor muito distintas, fácil de classificar.
  - **Rostos com e sem máscara** vêm da webcam, com luz, ângulo e fundo variando. Uma **xícara na frente do rosto** pode confundir o modelo ("é uma máscara?"). São **casos-limite** (*edge cases*).
  - Com **poucos exemplos por classe**, ou exemplos pouco variados, o modelo generaliza mal. É o **viés de seleção** da Parte 1 de novo.
- **Caso de uso real (pandemia):** detectar se as pessoas estavam usando máscara em ambientes de trabalho.

**Demonstração da professora (vídeo gravado, porque o Lobe usa muita GPU e derrubava o notebook dela):**
- **Caso:** a identificação de máscara, uma solução muito usada, por exemplo, **em aeroportos durante a pandemia**.
- **Amostra mínima:** 10 imagens, **5 com máscara e 5 sem máscara**.
- **Boa prática, base de treino × base de teste:**
  - **Treino:** o que é mostrado ao modelo.
  - **Teste:** imagens **reservadas e inéditas**, usadas só no final. *"Se eu mostro algo que ele já viu, ele cola da base dele."*
- **Rotulagem (labeling) manual:** *"Sou eu dizendo com máscara, sem máscara… e ainda é assim."* É uma **fragilidade**: exige um **esforço humano enorme e é passível de erro**. A OpenAI chegou a ser **acusada de subcontratar mão de obra** para rotular dados. *"Quando olho isso, penso que não estamos tão perto da AGI."*
- **Treinar** é identificar as características das imagens para montar a "malha". O modelo atingiu **80% de acurácia**.
- **Teste:** acertou "com máscara", mas **sem absoluta convicção**, e pediu confirmação. Ao confirmar, **o modelo retreina na hora** (os números no canto mudam) e *"fica mais espertinho"*.
- ⚠️ **Overfitting:** depois de alguns retreinos, o modelo chegou a **100%**. *"Parece que 100% é bom, mas não é."* **A realidade nunca é quadrada, tem muitas nuances.** Um modelo que acerta tudo indica que a **amostra é pequena ou idealizada demais**. Com só 10 imagens, ela **não colocaria isso em produção**.

#### 🧮 Conceito-chave: Overfitting (sobreajuste)
- O modelo **"decora" a base de treino** em vez de aprender o padrão geral. Vai muito bem no treino e **mal com dados novos**.
- **Sinais:** acurácia de 100% ou perto disso, grande diferença entre o desempenho no treino e no teste.
- **Causas:** amostra pequena, pouco variada ou "arrumada" demais.
- **Como evitar:** mais dados e mais variados, separar treino e teste (e validação), validação cruzada, modelos mais simples.

**Refino (fine tuning) e casos-limite:** e se alguém **puser a mão na frente da boca**? E uma **máscara com o desenho de uma mão estampado**? *"Aí começamos a apertar os parafusos"* para **generalizar** o modelo e fugir dos **vieses** da Parte 1. **É aí que se gasta muito tempo.**

**Ferramenta citada: Dataiku** *("não é merchan")*
- Plataforma colaborativa em que **cientistas de dados e gestores trabalham juntos**: um levanta a hipótese e o outro já derruba.
- Faz o tratamento dos dados na própria ferramenta e **testa 10 a 15 modelos estatísticos automaticamente** (**AutoML**), trazendo o de melhor desempenho em **cerca de 1 hora**. Depois vem o **fine tuning**.

**Para líderes:** com ferramentas no-code, **qualquer área de negócio pode prototipar** um modelo de visão em minutos. Mas colocar em produção exige **dados representativos, métricas (FP/FN) e governança**.

### 17b. YOLO: o estado da arte em visão computacional *(vídeo mostrado pela professora, sem slide)*
- **YOLO** (*You Only Look Once*) é um modelo de **detecção de objetos em tempo real**. Ele olha a imagem uma única vez e identifica **vários objetos ao mesmo tempo**, com uma caixa ao redor de cada um e a **confiança entre parênteses** (ex.: "pessoa 100%", "carro 90%").
- **Destaque:** o **tempo de resposta é baixíssimo**. No vídeo (YOLO v4), a pessoa se mexe de propósito e o modelo acompanha na hora, mapeando a rua toda. As versões atuais do YOLO são bem mais altas.
- **Mas erra:** no vídeo, o modelo **confundiu um gato com um cachorro** (90% de convicção).
- **Meme citado:** uma IA rotulou como **"tigre"** um cachorro deitado perto do portão ao entardecer, porque a **sombra das grades fazia listras** no corpo dele.
- **Mensagem da professora:** *"A AGI já é um tema em voga, mas a IA ainda comete erros absurdos como esse."* É preciso **cuidado nas discussões**, **muitos guardrails** nas soluções e atenção aos **vieses**.

### 18. Tipos de Machine Learning
**Slide:** os três tipos: **Aprendizado Supervisionado**, **Aprendizado Não Supervisionado** e **Aprendizado por Reforço**.

| | **Supervisionado** | **Não Supervisionado** | **Por Reforço** |
|---|---|---|---|
| **Dados** | **Rotulados** (entrada + resposta certa) | **Sem rótulo** | Sem base fixa: um **agente interage com um ambiente** |
| **Objetivo** | Prever ou classificar a resposta de casos novos | **Descobrir padrões, grupos e estruturas** escondidos | **Aprender a melhor sequência de ações** para maximizar a recompensa |
| **Como aprende** | Compara a previsão com o rótulo e corrige o erro | Agrupa por semelhança e reduz dimensões | **Tentativa e erro**, com recompensa (+) e punição (−) |
| **Tarefas típicas** | **Classificação** (fraude sim/não, com/sem máscara) e **Regressão** (prever valor, demanda, preço) | **Clusterização** (segmentar clientes), **detecção de anomalias**, **regras de associação** ("quem compra X compra Y") | Jogos, robótica, carros autônomos, otimização de rotas e preços |
| **Exemplos da aula** | Quick, Draw! (item 15), Lobe/máscara (item 17), fraude (item 16) | *(a ver na aula)* | *(a ver na aula)* |
| **Analogia** | Professor com gabarito (o **hipopótamo** no zoológico) | Separar peças de Lego por semelhança **sem ninguém dizer as categorias** | Treinar um cachorro com petiscos |
| **Algoritmos** | Regressão linear/logística, árvores de decisão, Random Forest, redes neurais | K-means, DBSCAN, PCA | Q-Learning, Deep Q-Network (AlphaGo, AlphaZero) |

- 📌 Segundo a professora, **~80% da IA aplicada hoje é supervisionada**.
- As **GANs (item 9)** são geralmente classificadas como **não supervisionadas**: aprendem a distribuição dos dados reais sem rótulos.
- Os **LLMs** combinam os três: pré-treino **autossupervisionado**, ajuste fino **supervisionado** e **RLHF**, que é aprendizado **por reforço** com feedback humano.

> _(pontos da professora serão adicionados quando o próximo bloco de áudio for transcrito)_

### 19. Supervisionado (Classificação) × Não Supervisionado (Clusterização)
**Slide** (crédito: Bruno Kenji):

**🟧 Supervised Learning, algoritmo de classificação**
```
Treino:  🦆 "Duck"  🦆 "Duck"  🐇 "Not Duck"  🦔 "Not Duck"
            → [Supervised Learning] → [Predictive Model]
Uso:     🦆 (novo, nunca visto) → [Predictive Model] → "Duck"
```
- Cada imagem de treino vem **com o rótulo**, a resposta certa ("pato" ou "não pato").
- O algoritmo gera um **modelo preditivo**.
- Um **pato novo**, que o modelo nunca viu, é classificado corretamente como **"Duck"**.
- A pergunta que ele responde já está **definida pelo humano**: "é pato ou não é?".

**🟦 Unsupervised Learning, algoritmo de clusterização**
```
Entrada: 🦆 🦆 🐇 🦔 🦆   (sem nenhum rótulo)
            → [Unsupervised Learning] →
Saída:   [🦆 🦆 🦆]   [🐇]   [🦔]    (3 grupos formados por semelhança)
```
- As imagens entram **sem rótulo**. Ninguém disse o que é pato.
- O algoritmo **agrupa por semelhança** (forma, cor, textura) e forma **3 clusters**: patos, coelho e ouriço.
- **Ele não sabe o nome dos grupos**, só que os membros de cada um são parecidos entre si. **Cabe ao humano interpretar** ("este grupo são patos").

**A diferença em uma frase:**
> **Supervisionado:** *"Aprenda a reconhecer o que eu já sei que existe."* **Não supervisionado:** *"Me mostre o que existe nos dados e eu não sei."*

| | Classificação (supervisionado) | Clusterização (não supervisionado) |
|---|---|---|
| Rótulos | Necessários (custo humano alto, veja o item 17) | Não precisa |
| Categorias | Definidas **antes** pelo humano | **Descobertas** pelo algoritmo |
| Saída | Rótulo previsto ("Duck") | Grupos sem nome |
| Uso em negócios | Fraude, churn, crédito, diagnóstico | **Segmentação de clientes**, perfis de consumo, anomalias |

**Explicação da professora:**
- **Supervisionado:** "pato, pato, não pato, não pato". O modelo aprende as características. Se aparece um pato com o **pescoço mais comprido**: *"tá mais compridinho, mas é pato"*.
- **Pergunta da turma:** *"E se eu não tiver uma base de dados rotulada para mostrar ao modelo?"* Dá para fazer, sim: **clusterizar**. O modelo **não consegue pôr o rótulo, mas agrupa os semelhantes**. *"Classificar pato não tem utilidade, não somos zoológicos, mas fazemos muito isso no mercado."*

**🛒 Caso de e-commerce (professora):** com big data e o **log de navegação**, é possível **clusterizar como cada cliente navega** no site:
| Cluster | Comportamento | Ação |
|---|---|---|
| **Redução de preço** | Navega de forma **objetiva**, vai direto ao produto, mas **não clica em comprar** | Oferecer **desconto**, porque *"quem quer muito e não compra, o motivo nº 1 é preço"* |
| **Oferta dos indecisos** | Olha **coisas muito diversas**, não sabe o que quer | Reduzir preço **não faz sentido**. A abordagem é outra (ex.: recomendação, curadoria) |
> O cluster pode ser criado **sem saber o nome dele no primeiro momento**. Os nomes ("indecisos") vêm da interpretação humana depois.

**Exemplo de negócio:** um banco aplica clusterização na base de clientes e descobre 5 perfis de comportamento que ninguém tinha definido (ex.: "jovens digitais que investem pouco", "aposentados conservadores"). Depois, pode usar esses grupos como **rótulos** para modelos supervisionados. **Os dois tipos se complementam.**


### 20. Aprendizado por Reforço: MarI/O
**Slide:** vídeo *"MarI/O - Machine Learning for Video Games"* ([youtube.com/watch?v=qv6UVOQ0F44](https://www.youtube.com/watch?v=qv6UVOQ0F44)), de SethBling (2015). Uma IA aprende sozinha a jogar **Super Mario World**.

**O que aparece na tela:**
- **Caixa à esquerda:** o que a IA "enxerga", uma versão simplificada da fase (blocos = chão, pontos = inimigos). São as **entradas** da rede neural.
- **Linhas verdes e vermelhas:** as **conexões da rede neural** (verde = estímulo positivo, vermelho = negativo).
- **À direita:** os **botões do controle** (A, B, X, Y, Up, Down, Left, Right), que são as **saídas**, ou seja, as **ações** que a IA decide apertar.
- **Topo:** *Gen 34 · species 14 · genome 14 · Fitness: 260 · Max Fitness: 4322*.

**Como aprende (tentativa e erro com recompensa):**
1. A IA começa **sem saber nada**. Aperta botões aleatórios e o Mario morre ou fica parado.
2. Cada tentativa recebe uma **nota: o *fitness*** (recompensa), basicamente **quão longe e quão rápido o Mario chegou** na fase.
3. As redes com maior fitness **sobrevivem e se reproduzem com pequenas mutações** na geração seguinte, e as piores são descartadas.
4. Depois de dezenas de **gerações** (Gen 34 no slide), surge uma rede que atravessa a fase inteira, **sem que ninguém tenha programado "pule quando vier um inimigo"**.

**Segundo print do vídeo (0:55 / 5:57):** *Gen 34 · species 14 · genome 14 · **Fitness: 597** · Max Fitness: 4322*. O fitness sobe à medida que o Mario avança. A caixa de "visão" mostra um **inimigo voador** (Super Koopa), e a rede ativa **Left** e outros botões para reagir. Dá para ver quais **conexões (verde/vermelho)** estão ativas em cada decisão.

**Explicação da professora:**
- A "hastezinha vermelha" é o Mario, e a caixa é **o que a IA está enxergando**. Os botões são os controles.
- **O reforço está no *fitness*:** enquanto o Mario acerta (não cai no buraco, não esbarra no inimigo), **o fitness sobe**. Quando erra, **despenca**, e na próxima vez a IA **muda o caminho**. *"Ela entende que está acertando, apesar de não entender de Mario."*
- **Analogia com a educação dos filhos:** *"se fizer tal coisa, fica de castigo; se fizer outra, ganha um prêmio"*.

**Pergunta do Mário (colega): isso é machine learning ou deep learning?** É **deep learning**, pela complexidade.
| Dica | Machine Learning "clássico" | Deep Learning |
|---|---|---|
| **Tipo de dado** | **Estruturado**: tabela, ex.: transações marcadas fraude/não fraude | **Não estruturado**: vídeo, imagem, áudio, *"são pixels, não estão tabulados"* |
| **Complexidade** | Menor. *"Na maioria das vezes, ML é suficiente"* | Maior. Usa **redes neurais com muitas camadas**, *"como um funil resolvendo o problema"* |
> 📌 **Regra prática da professora:** **dado estruturado → machine learning; dado não estruturado → deep learning.** Deep learning é um **subconjunto** de machine learning.

**Utilidade real do reforço** (além de "zerar Pokémon", como o Vitor comentou sobre o Fable):
- **Robótica** (braços mecânicos, carregar caixas) e **carros autônomos**, treinados em **simuladores**: *"passou no semáforo vermelho, atropelou alguém → despenca o fitness"*.
- Hoje os carros autônomos usam **uma mescla de tipos de aprendizado**, mas o **reforço é o principal** para ensinar comportamentos "robóticos" que simulam o humano: jogar, andar na rua, carregar caixas.

📌 **Nota técnica para a prova:** o MarI/O usa o **NEAT** (*NeuroEvolution of Augmenting Topologies*), um **algoritmo genético/evolutivo** que evolui redes neurais. Ele é muito usado para **ilustrar o aprendizado por reforço** porque compartilha a essência: **um agente, um ambiente, ações e uma recompensa**, sem dados rotulados. O RL "clássico" (Q-Learning, por exemplo) ajusta o próprio agente a cada ação, em vez de selecionar os melhores de uma população.

**Os elementos do Aprendizado por Reforço:**
| Elemento | No MarI/O | Num negócio (ex.: precificação dinâmica) |
|---|---|---|
| **Agente** | A rede neural que controla o Mario | O sistema que define preços |
| **Ambiente** | A fase do jogo | O mercado e os clientes |
| **Estado** | O que a IA enxerga (blocos e inimigos) | Demanda, estoque, concorrência, horário |
| **Ação** | Apertar A, B, ←, → … | Subir ou baixar o preço |
| **Recompensa** | *Fitness* (distância percorrida) | Receita ou margem |

**Onde aparece no mundo real:** AlphaGo e AlphaZero (DeepMind), robótica, carros autônomos, **otimização de rotas** e logística, **precificação dinâmica** (Uber, companhias aéreas), sistemas de recomendação e o **RLHF**, que ajusta ChatGPT, Claude e Gemini com feedback humano.

**Cuidado, "reward hacking":** o agente otimiza **exatamente** a recompensa definida, não o que você *quis dizer*. Se a recompensa for mal desenhada, ele acha atalhos indesejados (ex.: um agente de jogo que descobre um bug para ganhar pontos infinitos sem terminar a fase). **Para líderes:** a escolha da métrica de recompensa é uma **decisão de negócio e de ética**, como a escolha entre FP e FN (item 7) e o risco de metas como "200 agentes" (Parte 5).

### 21. Mapa do Machine Learning (DATAGEEKS)
**Slide:** mapa mental com as grandes famílias de ML e seus algoritmos. **É um ótimo slide para revisar e consultar.**

```
                            MACHINE LEARNING
      ┌──────────────┬──────────┴───────┬───────────────────┐
 CLASSICAL       REINFORCEMENT      ENSEMBLE          NEURAL NETS &
 LEARNING          LEARNING          METHODS          DEEP LEARNING
   ├─ Supervised
   └─ Unsupervised
```

**1. Classical Learning (ML "clássico", em geral com dados estruturados)**
| Ramo | Tarefa | Algoritmos | Exemplo de negócio |
|---|---|---|---|
| **Supervised** | **Classification**: prever uma **categoria** | Naive Bayes, K-NN, SVM, Decision Trees, Logistic Regression | Fraude sim/não, churn, spam |
| | **Regression**: prever um **número** | Linear, Polynomial, Ridge/Lasso Regression | Previsão de vendas, preço de imóvel |
| **Unsupervised** | **Clustering**: agrupar semelhantes | K-Means, DBSCAN, Mean-Shift, Agglomerative, Fuzzy C-Means | Segmentação de clientes, "indecisos" (item 19) |
| | **Pattern search**: regras de associação | Apriori, Eclat, FP-Growth | "Quem compra pão compra manteiga" (cesta de compras) |
| | **Dimension reduction (generalization)** | PCA, t-SNE, LSA, SVD, LDA | Reduzir centenas de variáveis a poucas, visualização |

**2. Reinforcement Learning**: Genetic Algorithm (como o **NEAT do MarI/O**, item 20), Q-Learning, SARSA, Deep Q-Network (DQN), A3C.

**3. Ensemble Methods**: combinam **vários modelos** para ter um resultado melhor (*"a sabedoria das multidões"*).
- **Bagging:** vários modelos em paralelo votam. Ex.: **Random Forest**, que é uma "floresta" de árvores de decisão.
- **Boosting:** modelos em sequência, cada um corrige os erros do anterior. Ex.: **XGBoost, LightGBM, CatBoost, AdaBoost**, campeões em dados tabulares (crédito, fraude).
- **Stacking:** um modelo "chefe" combina as previsões dos outros.

**4. Neural Nets and Deep Learning** (dados não estruturados, veja a regra acima)
| Arquitetura | Especialidade | Exemplos na aula |
|---|---|---|
| **Perceptrons (MLP)** | Rede neural básica, com camadas totalmente conectadas | Base de tudo |
| **CNN** (Convolutional) / DCNN | **Imagens e visão computacional** | Quick, Draw!, Lobe, YOLO, reconhecimento facial |
| **RNN** (Recurrent): LSTM, GRU, LSM | **Sequências**: texto, voz, séries temporais | Tradução, previsão de demanda |
| **GAN** (Generative Adversarial Networks) | **Gerar** dados sintéticos | "Esta Pessoa Não Existe", deepfakes (itens 8 e 9) |
| **Autoencoders** / seq2seq | Comprimir e reconstruir dados, detectar anomalias | Fraude, compressão |

> 📌 **O que falta no mapa:** os **Transformers** (2017, *"Attention Is All You Need"*), a arquitetura por trás dos **LLMs** (GPT, Claude, Gemini) e da IA generativa atual, que substituiu as RNNs em texto. É o tema da **próxima aula (IA Generativa)**.

---

## Encerramento da 1ª parte da aula
- A professora fechou a **"rápida literacia" de IA clássica**: *"Hoje foi mais rico falarmos do mercado, das preocupações e dos desafios. Gastamos mais tempo com isso, mas eu queria trazer esses primeiros conceitos."*
- ➡️ **A partir da próxima aula: IA Generativa.** Os conceitos de hoje (tipos de aprendizado, ML × DL, overfitting, FP/FN, vieses) serão repetidos daqui em diante.
- Depois do café: **"Mão na Massa"**.

---

## Parte 8: Hands On: Correlação Estatística

### Enunciado (slide "Vamos Aplicar?")
> Aplique **correlação estatística** e analise as correlações com resultados **maiores que 0,4 ou menores que −0,4**. Liste quais **hipóteses** podem ser levantadas. Para a entrega, use o **caderno de hipóteses** (template fornecido), crie um **PDF** e suba no portal.

### Contexto (professora)
- Vamos montar juntos um **caderno de hipóteses para o diretor de uma área de suporte de TI**.
- Tecnicamente é **estatística descritiva/aplicada**. *"Não chega a ser machine learning"*, mas mostra **o que o cientista de dados faz na IA clássica** e o valor disso.
- Não é preciso ter formação em exatas: *"a maturidade de carreira e as percepções de vocês já serão úteis demais"* para levantar hipóteses.
- A correlação é usada no contexto de **BI e KPIs** para ver **o quanto as métricas caminham juntas** e se há **suspeita de impacto** de uma sobre a outra. **Correlação dá pistas, não prova causa.**

### 🧮 Conceito-chave: Correlação de Pearson (r)
- Mede a **força e o sentido da relação linear** entre duas variáveis numéricas. Varia de **−1 a +1**.

| Valor de r | Leitura |
|---|---|
| **+1** | Correlação positiva perfeita: as duas sobem juntas |
| **> +0,4** | Positiva **relevante** (critério do exercício) |
| **~0** | Sem relação linear |
| **< −0,4** | Negativa **relevante**: quando uma sobe, a outra desce |
| **−1** | Correlação negativa perfeita |

- **Faixas usuais:** |r| de 0,4 a 0,5 é moderado-fraco, de 0,5 a 0,7 é moderado, de 0,7 a 0,9 é forte e acima de 0,9 é muito forte.
- ⚠️ **Correlação ≠ causalidade:** pode haver **variável omitida** (Parte 1, item 3: o QI por trás do tempo de estudo e da nota), coincidência ou causalidade reversa. Por isso o resultado vira **hipótese** a ser validada, não conclusão. É também uma proteção contra o **viés de confirmação** (item 2).
- **Em Excel/Sheets:** `=CORREL(A:A; B:B)`. **Em Python:** `df.corr()`.

### Exemplos da professora
| Exemplo | Coeficiente | Leitura |
|---|---|---|
| 🍦 **Temperatura × venda de sorvete** | Forte e **positivo** (perto de +1) | *"Sobem juntas e descem juntas."* O dono da sorveteria usa isso para planejar **estoque, distribuição e sazonalidade** |
| ⚖️ **"Como uma balança"** | Forte e **negativo** (perto de −1) | Quando uma sobe, a outra desce. **"Atenção ao sinal!"** |
| 🇺🇸 **Temperatura cai → vendas do varejo explodem (2º semestre nos EUA)** | Forte e negativo, mas **ESPÚRIO** | **Pegadinha proposital**: não é o frio nem o casaco. São as **datas comemorativas (Ação de Graças e Natal)** que impulsionam o varejo. É a **variável omitida** de novo |
| 🎬 **Filmes do Nicolas Cage × afogamentos** | Perto de +1, mas **espúrio** | *"Tem correlação, é inegável, mas não implica relação causal. Mera coincidência."* |

**Pontos para o exercício:**
- O coeficiente vai **sempre de −1 a +1**. **Perto de 0 = sem correlação.**
- 💡 **Ausência de correlação também é informação:** *"Eu esperava uma correlação e ela não apareceu. Opa! Isso também é informação."* Vale registrar no caderno.
- **Correlação espúria** = relação causal indevida, *"é fake"*. *"Existe um monte de coisa acontecendo ao mesmo tempo, e não significa que uma impacta a outra."*
- É preciso **feeling do negócio**. Se você não conhece o negócio, **apoie-se no gestor ou dono do processo** (*business owner*) e **investigue** cada correlação para garantir que ela tem significado.
- **Estrutura de cada hipótese no caderno:** correlação encontrada (r e sinal) → interpretação de negócio → **ela pode ser espúria? há variável omitida?** → como validar → ação sugerida.

### Como apresentar: gráfico de dispersão (não a matriz)
- Numa reunião, **a matriz de números é "fria"** e quem não é da área pode não entender. **Leve o gráfico de dispersão**, que existe no Power BI, no Tableau e no Excel.

| Formato dos pontos | Leitura |
|---|---|
| ↗️ **Diagonal crescente**, pontos próximos | Correlação **forte positiva** |
| ↘️ **Diagonal decrescente**, pontos próximos | Correlação **forte negativa** |
| Pontos **um pouco espalhados**, mas com tendência | Correlação **moderada** |
| Pontos **completamente dispersos** | **Sem correlação** |

- 💡 **Exemplo de ausência de correlação útil:** *"Fiz uma ação de marketing para alavancar vendas e não há correlação. A ação não funcionou."*

### Exemplo resolvido em aula: case de Trade Marketing (Red Bull)
> ⚠️ **É só um exemplo.** *"Vocês vão fazer em outra base de dados, com outro tema"* (suporte de TI).

- **Contexto:** na indústria de consumo (B2B), **70 a 80% da decisão de compra acontece no ponto de venda**, e a indústria não o enxerga. O gestor da Red Bull não sabia se havia **ruptura** (falta do produto) nem se o **preço praticado** estava bom, já que quem define o preço é o varejo. A solução foi **capturar dados dentro da loja**.
- **Base enxuta** (uma linha por loja/visita):
  - **Preço** praticado
  - **Promotor** (tem ou não tem)
  - **Quantidade distribuída** para a loja
  - **Quantidade vendida**
- **Como ela fez:** no **Excel com o Copilot** (poderia ser o Claude integrado ao Excel), com o prompt **"Aplique correlação estatística"**.
  - Sem Copilot: **suba a base em qualquer LLM** (ChatGPT, Gemini, Claude) com o mesmo pedido.
  - Em Python: `dataset.corr()`.
- **O que a ferramenta faz:** combina **todo mundo com todo mundo** (preço × promotor, preço × distribuída, preço × vendida, promotor × distribuída, promotor × vendida…) e devolve a **matriz** de −1 a +1. O Copilot **já gerou o mapa de calor** sozinho.
- **Método:** **Pearson**, *"uma forma de calcular, mas existem outras"*. Para estudar: **Spearman** (usa postos; boa para relações monotônicas não lineares e com outliers) e **Kendall**.

**Correlações fortes encontradas na base Red Bull:**
| Par | r | Leitura |
|---|---|---|
| **Qtd. distribuída × Qtd. vendida** | **+0,92** | Forte **positiva** (Felipe identificou) |
| **Promotor × Preço** | forte **negativa** | Quando há promotor, o preço é menor (ou o contrário) |
- Nesta base, *"a partir de 0,8 já faria sentido"* como corte. **No exercício o corte é |r| > 0,4.**

### 📓 O que é o Caderno de Hipóteses (professora)
- **Hipóteses são insights e percepções.** Podem vir **do que já sei do negócio**, então o caderno pode começar **antes da correlação**, no **levantamento de requisitos com o cliente**.
- Também são **o que aparece na matriz** e que depois precisa ser **discutido, provado** e virar **ação**, como uma **recomendação de ação corretiva**.
- **Hipóteses podem ser derrubadas.** Por isso **tudo é escrito como pergunta**, com "?".
- **Roteiro de discussão de cada correlação:**
  1. O que significa? (sobem juntas, descem juntas / sentido oposto)
  2. **Faz sentido para o negócio ou é espúria?**
  3. Se faz, **por quê?** Quais hipóteses explicam?
  4. Que **ação** recomendar?

**Hipóteses levantadas pela turma (H1: distribuída × vendida, r = +0,92):**
- **Felipe, disponibilidade do produto:** se o produto está disponível no ponto de venda, **a venda acompanha**. A distribuição **causa** a venda.
- **Raul, causalidade reversa:** *"Para mim seria o contrário: por eu vender mais, ele vem mais para mim."* A **venda puxa a distribuição**. É provavelmente uma visão histórica/mensal de reposição.
- **Rafael, proporção:** olhando os números absolutos (170, 240, 50, 30…), a **proporção entre distribuído e vendido se mantém**, com uma diferença de cerca de 25 a 30%. As lojas vendem de 60 a 80% do que recebem.
- **Otávio:** *"Quanto mais distribuo, mais vendo."*
- **Pergunta da professora:** *"Será que, se eu aumentar a distribuição, aumento as vendas? Será que temos um risco?"* (por exemplo, encalhe ou validade).

> 💡 **Lição:** a mesma correlação admite **explicações em sentidos opostos** (distribuição → venda **ou** venda → distribuição). A correlação **não diz qual causa qual**. Por isso ela é **hipótese**.

### 📝 Caderno de hipóteses montado em aula (print do Excel)
**Matriz (Pearson, 50 observações, CODIGO_CAPTURA excluído por ser identificador):**
| | PRECO | PROMOTOR | QTD_DISTRIBUIDA | QTD_VENDIDA |
|---|---|---|---|---|
| **PRECO** | 1,00 | **−0,98** | −0,06 | **−0,43** |
| **PROMOTOR** | −0,98 | 1,00 | −0,03 | 0,33 |
| **QTD_DISTRIBUIDA** | −0,06 | −0,03 | 1,00 | **0,92** |
| **QTD_VENDIDA** | −0,43 | 0,33 | 0,92 | 1,00 |
> *"Correlação mede associação linear; não comprova causalidade."*

**Hipóteses registradas pela turma:**

*Distribuída × Vendida (+0,92)*
1. Disponibilidade do produto
2. Porque vendo mais, preciso de mais distribuição (causalidade reversa)
3. Proporção sendo mantida
4. Quanto mais distribuo, mais vendo
5. **Giro de estoque**

*Promotor × Preço (−0,98)*
6. **O promotor está atuando na negociação** (consegue preço menor na loja)
7. **O promotor está diminuindo a margem** (o preço menor reduz a margem do varejo ou da indústria)

**Discussão de Promotor × Preço (−0,98), passo a passo da professora:**
1. **Primeiro explique a correlação e só depois levante hipóteses.** *"Sobe promotor, cai preço. Desce promotor, sobe preço."* Como **PROMOTOR é binário (0/1)**, "sobe" = **presença** e "desce" = **ausência** do promotor.
2. **Hipóteses da turma:**
   - O promotor **convence o estabelecimento** a cobrar um preço melhor (**negociação**).
   - O promotor negocia uma taxa que **reduz a margem** (de lucro, para a comissão dele ou para custo).
   - **Raul, preço tabelado/sugerido:** com promotor, a loja tem a informação do preço sugerido. Sem promotor, pratica preço maior e **a venda cai**. É como o **preço sugerido na tampa da Coca**, uma tentativa da indústria de **regular o preço para baixo**, que o promotor reforça.
   - **Peter, promoções:** o promotor costuma ser **enviado em época de promoção** ("leve 3, pague 2"), então **o preço já está baixo por causa da campanha**, e não por causa do promotor. É uma possível **variável omitida: a promoção**. A professora registrou: *"promotor atuando com pacotes promocionais"*.
3. **Pergunta para fechar o raciocínio:** *"Mantemos ou demitimos o promotor? Ele está fazendo o papel dele?"*
   - Ele **impacta o preço, isso é fato**. Mas **está impactando a venda?** (Promotor × Vendida é só **+0,33**, abaixo do corte.)
   - A turma disse: *"falta estratégia"* e *"qual é a meta dele?"*. Se a meta for vender mais, ele corta preço, e isso pode **sacrificar margem sem aumentar tanto a venda**.

   - **Leitura da professora:** Promotor × Vendida = **0,33**, *"bem tímido, mais perto do zero"*. A impressão inicial é que **o promotor não está alavancando a venda** (em valor absoluto). Valeria trazer outras métricas, como a **taxa de conversão**. (No exemplo resolvido abaixo, Promotor × Taxa de conversão dá **+0,92**. Com essa métrica a conclusão muda!)
   - *"Nunca escrevemos no caderno 'o produto é ruim'"*, mas buscamos caminhos para **mostrar deficiências no processo**.

### 📊 Antes da correlação: estatística descritiva
- A correlação é uma função do **primeiro passo estatístico**, a **estatística descritiva** (`.corr()` no Python).
- Seria ótimo começar com um **overview descritivo**: **média, mediana, máximo, mínimo e desvio padrão**.
  - **Média:** soma ÷ quantidade.
  - **Desvio padrão:** o quanto os dados variam.
  - **Mínimo e máximo:** ajudam a achar **outliers**.
- *"Coisas simples de fazer, mas que já dizem muito sobre os dados."* A planilha tem uma aba **"Estatística Descritiva"** com isso.

### 🤖 De estatística a Machine Learning: regressão linear
- A professora pegou **Distribuída × Vendida**, pediu o **gráfico de dispersão** e depois a **linha de tendência (equação da reta)**. Ela disse 0,98, mas o valor da matriz é **0,92**.
- **Equação da reta:** *"uma reta que tenta ficar posicionada o mais próximo possível dos pontos"*.
- 💡 **"Acabei de fazer uma regressão linear, que é inteligência artificial, é machine learning."** É aprendizado **supervisionado** do tipo **regressão** (Mapa do ML, item 21).
- **Para que serve:** fazer **inferências**, ou seja, olhar os dados históricos e projetar o futuro. **Dado o valor de um eixo, infiro o outro.** Ex.: *"se eu distribuir 150 unidades, quanto devo vender?"*
- **Inferência da turma:** *"Para vender mais, eu teria que aumentar a distribuição e não trabalhar com promotoria, porque o promotor não estava resolvendo e o preço estava caindo."* A professora achou uma **hipótese interessante, mas que precisa ser validada**.
- **Fórmula (para estudo):** `vendida = a × distribuída + b`. O **a** (inclinação) diz quantas unidades a mais se vende para cada unidade a mais distribuída.
- **Calculado na base de exemplo:** **vendida ≈ 0,65 × distribuída − 7,6**. A cada 100 unidades distribuídas, vendem-se cerca de 57 (ex.: 150 distribuídas → cerca de 90 vendidas). ⚠️ Projetar além do máximo observado (200) é **extrapolação**, e é arriscado.

> 🧪 **Como testar as hipóteses (professora):** use a base de exemplo e **simule**. Por exemplo, **aumente a distribuição e veja se o coeficiente muda**. *"Depois vamos ter que pensar em como testar essas hipóteses."*
> ⚠️ **Não confunda:** esta é a **base de exemplo**. O exercício entregue usa **outra base**.

> 💡 **Para sua entrega:** o modelo da aula é uma **lista curta de hipóteses por correlação**. Dá para aprofundar cada uma com: por que pode ser espúria, como validar e que ação tomar (como no exemplo completo abaixo).

### ✅ Exemplo resolvido completo (base `Captura_tabulado.xlsx`, 50 capturas)
Rodei o script na base da aula e incluí a coluna **TAXA_CONVERSAO** (vendida ÷ distribuída), que também está na planilha. Os resultados batem com a matriz do Copilot.

| # | Par | r | Hipótese (como pergunta) | Pode ser espúria? / Cuidado | Ação sugerida |
|---|---|---|---|---|---|
| H1 | Preço × Promotor | **−0,98** | Lojas **com promotor** praticam preço menor (média R$ 4,07 contra **R$ 7,50** sem promotor). O promotor **negocia preço**? Está **reduzindo a margem**? Ou só vai a lojas de rede com preço menor? | ⚠️ **As duas variáveis andam praticamente juntas**: toda loja com promotor tem preço de 3,5 a 4,5, e toda loja sem promotor tem 7,5. **Não dá para separar o efeito do preço do efeito do promotor** (colinearidade / variável omitida: tipo ou porte de loja?) | Teste A/B: colocar promotor em lojas de preço alto |
| H2 | Preço × Taxa de conversão | **−0,95** | Preço menor → a loja vende uma parte maior do que recebe? | Mesmo cuidado da H1 | Rever a política de preço sugerido ao varejo |
| H3 | Promotor × Taxa de conversão | **+0,92** | Promotor aumenta a conversão (**64% contra 41%**)? Ele repõe a gôndola, evita ruptura e dá visibilidade? | Mesmo cuidado da H1 | Calcular o ROI do promotor por loja |
| H4 | Distribuída × Vendida | **+0,92** | A disponibilidade gera venda (Felipe) **ou** a venda puxa a reposição (Raul)? O **giro de estoque** explica? | **Causalidade reversa** possível | Testar aumento de distribuição em lojas-piloto e monitorar encalhe |
| H5 | Vendida × Taxa de conversão | +0,56 | Lojas que vendem mais também convertem melhor? | Em parte **matemática**: a taxa é calculada a partir da venda | Não usar sozinha como evidência |
| H6 | Preço × Vendida | −0,43 | Preço maior → vende menos (elasticidade)? | Fraca, e confundida com o promotor | Analisar só as lojas sem promotor |
| — | Promotor × Distribuída | ~0 | **Ausência de correlação:** o promotor **não influencia quanto a loja recebe**. A distribuição ignora a presença do promotor? | *"Isso também é informação"* | Direcionar mais estoque às lojas com promotor, que convertem mais |

> 💡 **Achado de ouro para a apresentação:** preço, promotor e conversão parecem ser **o mesmo fenômeno**. Antes de concluir que "promotor vende mais", é preciso **desembaralhar** as variáveis. É a lição da **variável omitida** (Parte 1) na prática.

Os arquivos estão em o notebook `04_Hands_On_Correlacao/notebooks/handson_correlacao.ipynb` (heatmap e gráficos de dispersão).

### 📌 Regras da entrega (professora, 22:07)
- **Base:** `metrica_cx_corr_v2.csv`, uma **pesquisa interna de satisfação** feita por um gestor de Suporte de TI com seus **clientes internos** (colaboradores). Métricas de CX: **CES** (esforço), **RATINGS** (satisfação), **e_NPS** (recomendação), mais canal, criticidade, tempo, status e **idade** (a única característica do usuário).
- **Template:** "Caderno de Hipóteses.docx" → gerar **PDF** → upload no **portal**, com os **RMs separados por vírgula** no campo do upload. A identificação no Word *"é só para constar"*.
- **Prazo:** não acaba hoje. É possível entregar **até a próxima aula**.
- **Informar qual IA/LLM** foi usada (qualquer uma).
- ⚠️ **Espírito do exercício:** *"Poderíamos pedir ao GPT para fazer tudo e ir dormir, mas não é a função de vocês na liderança de IA. **Vamos usar a IA e nos manter no loop.**"*
- **Processo:**
  1. **Etapa 1, sem IA:** hipóteses de *feeling*, só pelo dicionário de dados. *"É assim que a coisa começa: o gestor despeja tudo o que pensa e a gente registra."* Serve para ver **dogmas caírem**. Três hipóteses é só o número do template; pode ser mais ou menos.
  2. **"Aplique estatística descritiva"** (o `describe`: média, máximo, mínimo, mediana, desvio padrão). Pode colar o print ou os números no template.
  3. **"Aplique correlação estatística"**, colar a matriz e separar as correlações fortes.

### 📌 Orientação etapa por etapa do template (professora, 22:12)
- **Etapa 1, sem IA:** *"Não burlem a experiência."*
- **Etapa 2:** mapeiem as correlações encontradas e também **o que NÃO deu correlação**, e se essa ausência tem significado para o negócio.
- **Etapa 3:** escrevam o **prompt** e peçam à IA para analisar as correlações. **A IA vai misturar tudo**, então classifiquem cada afirmação:
  - **Constatação:** só a leitura (*"sobe a temperatura, sobe a venda de sorvete"*).
  - **Hipótese:** uma explicação ou ação a testar (*"vale investir mais em estoque no verão"*).
  - **Causal indevida / espúria:** *"está acontecendo, mas não implica causalidade. É mera coincidência."*
  - *"A IA faz tudo em 5 segundos, mas **quem assina o caderno de hipóteses é você, não o LLM**."*
  - Se a IA **deixou passar algo que vocês levantaram na Etapa 1**, anotem.
- **Etapa 4:** *"O que interessa no fim, o que vai para o gestor, é a partir do item 4."* Vocês **decidem quais hipóteses entram e quais ficam de fora**.
- **Etapa 5:** ajudem o gestor, que *"não entende de hipóteses nem de correlação"*: recomendação, evidência, **experimento para testar causalidade** e **custo do erro**, estimado para deixá-lo confortável na decisão.
- **Resumo:** *"Um bom caderno de hipóteses é um ensaio com a IA como copiloto e um relatório final assinado por você, quando você filtra e decide o que fazer."*
- **Contexto da base:** o time de suporte atende a empresa em qualquer necessidade tecnológica (passar cabo, trocar monitor, instalar software, atualizar a máquina). O gestor quer entender se a empresa está sendo bem ou mal atendida.

### Como fazer (roteiro)
1. Carregar a base e manter só as **colunas numéricas**.
2. Calcular a **matriz de correlação** (todas × todas).
3. Filtrar os pares com **r > 0,4 ou r < −0,4**.
4. Para cada par, escrever a **hipótese de negócio**: *"Acreditamos que [X] influencia [Y] porque [razão]. Para validar, [como testar]."*
5. Preencher o **caderno de hipóteses** (template), gerar o PDF e subir no portal.

> 🛠️ Script pronto: `04_Hands_On_Correlacao/scripts/correlacao.py`, que gera a matriz, o heatmap, os pares relevantes e os gráficos de dispersão.

---

## Encerramento e logística (22:17)
- **Material:** o PDF dos slides de cada aula sempre termina com um **Hands On** e o **dicionário de dados**. O template (Word) e a base foram enviados no chat do Teams.
- **Grupos:** sorteados, com **4 a 5 integrantes**. ⚠️ **Anote o seu grupo.** A professora não controla os grupos (tem muitas turmas), e ele segue **até o fim da disciplina** (trocar não é proibido).
- **Tempo:** cerca de 40 minutos em grupo, até as 23h (horário oficial). Não é preciso voltar para a sala principal. O upload fica aberto no portal **até a próxima aula**.
- **Contato:** a professora atende pelo direct do Teams durante a semana.
- *"Aqui vocês têm liberdade para controlar o tempo. Estamos aprendendo a nos autoajustar."*

> 📝 **Meu grupo:** ______ · **Integrantes / RMs:** ______

---

## ✅ Checklist pós-aula
- [ ] Anotar o grupo e os RMs dos integrantes
- [ ] Preencher a **Etapa 1** (sem IA) com o grupo
- [ ] Revisar com o grupo o [Caderno_de_Hipoteses_CX_preenchido.docx](<../../projetos/correlacao-cx/entrega/Caderno_de_Hipoteses_CX_preenchido.docx>), usando o notebook [Caderno_Hipoteses_Grupo.ipynb](<../../projetos/correlacao-cx/notebooks/Caderno_Hipoteses_Grupo.ipynb>)
- [ ] Preencher a coluna "Etapa 1: confirma / contradiz / nova" e a pergunta "o que resistimos a abandonar?"
- [ ] Exportar em **PDF** e subir no portal com os **RMs separados por vírgula** (prazo: até a próxima aula)
- [ ] Preparar-se para a próxima aula: **IA Generativa, como funcionam os LLMs**

## Próxima aula
**IA Generativa:** como funcionam os LLMs, o ramo do Mapa de ML que desce de Deep Learning para GenAI (tokenização, embeddings, Transformers).
