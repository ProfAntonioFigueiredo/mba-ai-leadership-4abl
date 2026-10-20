# AI Core Concepts — Aula 2 — 19/10/2026

Professora: Tassiana Rugoni de Campos.
Fonte: transcrição ao vivo do Microsoft Teams, iniciada pela professora. Horários de Brasília.
Status: acompanhamento iniciado; não há captura independente do áudio por este agente.
Cobertura anterior às 19h17: não disponível na transcrição observada.

## Bloco 1 — 19h17–19h22 (parcial, em andamento)

### Conceitos e explicações observados
- A abertura retoma o conteúdo da primeira aula por meio de perguntas dos alunos no chat, para recuperar os conceitos após o intervalo entre os encontros.
- A professora começa a revisão do exercício de correlação da aula anterior; anuncia que o conteúdo seguinte terá maior foco em IA generativa.
- Correlação identifica variáveis que variam juntas, na mesma direção ou em direções opostas. Ela oferece pistas para investigar o negócio, sem estabelecer causalidade.
- Correlações podem ser espúrias: eventos que ocorrem juntos sem uma relação relevante para o negócio.
- A estatística descritiva e a análise exploratória abrem caminho para investigar problemas e construir modelos de machine learning e deep learning.
- O Caderno de Hipóteses compara as hipóteses iniciais, formuladas sem IA, com a análise posterior apoiada por IA.

### Aplicação à liderança
- Relacionar a análise estatística a uma pergunta de negócio e ao valor da decisão.
- Distinguir intuição inicial, associação observada e explicação causal.

### Pendências
- Capturar a continuação da correção do exercício e os exemplos apresentados.
- Bloco ainda não cobre cinco minutos completos; será atualizado com nova leitura.

## Organização para a apresentação final

A estrutura dos slides será definida após o encerramento, conforme os temas efetivamente registrados. Cada bloco deverá preservar conceitos, exemplos, dúvidas e referências mencionadas. Conteúdo não capturado será identificado como lacuna.

### Continuação do bloco 1 — revisão do exercício
- Em uma consultoria, primeiro se coletam as impressões do gestor. Depois, com dados consistentes, as hipóteses podem ser mantidas ou rejeitadas, ajudando a enfrentar o viés de confirmação.
- A revisão do exercício atende aos pedidos de alunos que precisaram de mais tempo para assimilar a parte estatística apresentada no fim da primeira aula.
- A professora apresenta na tela a matriz de correlação gerada no exercício; os valores ainda não foram registrados nesta leitura.

## Bloco 2 — aproximadamente 19h22–19h27 (em andamento)

### Leitura da matriz de correlação
- A professora retoma o corte do exercício: investigar coeficientes a partir de +0,4 ou abaixo de −0,4; trata-se do critério adotado nesta atividade.
- Correlação positiva: as variáveis tendem a subir ou descer juntas. Negativa: tendem a variar em sentidos opostos.
- **Idade × esforço:** a leitura apresentada é que maior idade está associada a maior percepção de esforço; isso ainda não explica o motivo nem estabelece causalidade.
- **Tempo para resolver × satisfação:** a professora destaca a associação aparentemente contraintuitiva de maior tempo com maior satisfação e convida a turma a explicar o resultado.
- A discussão diferencia ler o sinal da correlação de avaliar seu significado para o negócio.

### Questões para recuperar na apresentação
- Quais hipóteses da turma explicam idade × esforço?
- O que poderia explicar maior satisfação em atendimentos mais demorados?
- Quais evidências seriam necessárias para validar essas hipóteses?

### Complemento — relações entre métricas de experiência
- Maior NPS aparece associado a menor percepção de esforço.
- Maior NPS aparece associado a melhor avaliação do serviço.
- Maior esforço aparece associado a pior avaliação.
- A relação tempo × satisfação foi caracterizada pela professora como moderada e curiosa; não foi registrado um coeficiente exato nesta leitura.
- A professora solicita que representantes dos grupos apresentem seus achados mais relevantes e as hipóteses que ainda sustentam após a análise.
- O uso do LLM para calcular estatística descritiva e montar a matriz faz parte da atividade; a discussão se concentra na interpretação dos resultados.

## Bloco 3 — 19h27–19h32 (em andamento)

### Hipóteses da turma — idade × esforço
- Um representante de grupo propõe que dificuldades de entendimento de aplicações e das orientações de suporte poderiam explicar maior esforço entre pessoas mais velhas.
- **Classificação:** hipótese apresentada por aluno, ainda sem validação; não é uma conclusão sobre capacidade de pessoas de determinada idade.
- A professora acolhe a contribuição para aprofundamento posterior.

### Hipóteses alternativas e segmentação
- A professora levanta a possibilidade de uma equipe de suporte mais júnior ter dificuldade de comunicação com profissionais mais seniores. Isso desloca a investigação também para a qualidade da orientação oferecida.
- Outro grupo relata que **o canal telefônico pode estar por trás da associação entre idade e esforço**: pessoas mais velhas utilizariam mais o telefone; usuários mais jovens desse mesmo canal também apresentariam insatisfação.
- **Classificação:** achado relatado pelo grupo e acolhido pela professora como investigação relevante. Os números e recortes exatos ainda não foram mostrados na transcrição capturada.
- A professora afirma que a base foi preparada com armadilhas que exigem investigação mais detalhada.
- Implicação para a análise: segmentar por canal antes de atribuir a dificuldade à idade; comparar pessoas de idades diferentes dentro do mesmo canal.

## Bloco 4 — 19h32–19h37 (em andamento)

### Variável omitida: canal de atendimento
- A professora esclarece que **o exemplo de idade × esforço é de variável omitida**, e não o exemplo de paradoxo de Simpson que havia começado a mostrar em outro slide.
- No canal telefone, a idade média apresentada é de **51 anos**, e o esforço médio é maior.
- Segundo a explicação da professora, o telefone é problemático para todas as idades. Isso põe em dúvida uma explicação centrada exclusivamente na idade e orienta a investigação para o canal.
- As hipóteses iniciais sobre idade servem como ponto de partida, mas devem ser revistas à luz da segmentação.
- O paradoxo de Simpson foi mencionado em relação a outro slide, com recorte por criticidade; aguarda-se a explicação completa desse exemplo.

### Relato de validação de um grupo — por volta de 19h32–19h33
- Uma aluna relata correlação agregada de **0,47** entre idade e esforço, que desapareceu na análise dentro de cada canal. O grupo abandonou sua hipótese inicial centrada na idade.
- A professora confirma que essa investigação atende ao objetivo do exercício: usar o LLM para o trabalho de cálculo e aplicar experiência de negócio para interpretar o que a análise agregada esconde.
- **Cuidado para os slides:** o relato favorece investigar o canal como explicação da associação agregada; não equivale, por si só, a uma demonstração experimental de causalidade.

### Limite da conclusão explicitado pela professora
- Investigar por que determinado público usa mais o telefone e o que acontece nas ligações. A evidência apresentada ainda não permite inferir além desse direcionamento de investigação.

## Bloco 5 — aproximadamente 19h35–19h40 (em andamento)

### Tempo de resolução × satisfação
- A professora retoma a associação contraintuitiva entre maior tempo de resolução e maior avaliação.
- Um grupo propõe que chamados mais demorados possam ser percebidos como mais complexos; a resolução desses casos poderia gerar maior reconhecimento e satisfação.
- **Classificação:** hipótese do grupo, aguardando discussão e contraste com os recortes da base.

### Atenção, criticidade e contexto operacional
- Outro grupo sugere que mais tempo de atendimento possa representar maior cuidado, acompanhamento e confirmação de que o problema foi resolvido.
- Ao segmentar por **criticidade**, a professora mostra maior avaliação nos chamados de criticidade alta, que também consomem mais tempo.
- SLA acordado, equipe especializada e compreensão da complexidade pelo solicitante aparecem como possíveis explicações a verificar com o gestor, e não como fatos demonstrados apenas pela matriz.
- A professora enfatiza que conversar com o gestor é necessário para compreender esses mecanismos de negócio.

### Paradoxo de Simpson — tempo × avaliação
- **Na base agregada:** correlação positiva de **+0,42**, sugerindo maior satisfação associada a maior demora.
- **Dentro de cada um dos três níveis de criticidade:** correlações negativas; maior demora acompanha menor avaliação.
- O grupo de criticidade alta apresenta patamares de duração e avaliação mais altos, influenciando o resultado agregado.
- A professora apresenta essa divergência entre associação agregada e associações nos subgrupos como **paradoxo de Simpson**.
- Aprendizado para a liderança: verificar a composição dos grupos antes de transformar uma correlação agregada em orientação operacional.

## Bloco 6 — aproximadamente 19h40–19h45 (em andamento)

### Relevância de uma correlação
- A professora aponta que NPS × avaliação tem correlação alta, mas isso não torna a relação um achado importante por si só.
- Ela inicia a discussão sobre avaliar a utilidade dessas variáveis na construção de modelos estatísticos e de machine learning.

### Redundância, avaliação e postura crítica
- NPS e avaliação podem trazer informação redundante; correlação alta não basta para justificar manter ambas em um modelo.
- A professora anuncia que há viés de seleção na base e pergunta se algum grupo o encontrou; identificação ainda pendente neste trecho.
- **Orientação de avaliação anunciada ao vivo:** quatro entregas de 2,5 pontos. Para esta primeira atividade, os grupos que entregaram ou entregarem hoje receberão a pontuação pela entrega; a professora afirma que não descontará argumentações estatisticamente imprecisas, pois o objetivo era explorar o valor da IA clássica.
- Usar IA não encerra a atividade: é preciso validar suas hipóteses, investigar os dados e aplicar senso crítico.

## Bloco 7 — aproximadamente 19h45–19h50 (em andamento)

### IA como copiloto e aprendizado
- A professora relata feedback anônimo de outra turma: entregas feitas integralmente com IA resultaram em discussões rasas e desconforto de uma integrante.
- A orientação é manter o comando da investigação, aprofundando a análise além dos primeiros insights do ChatGPT.

### Viés de seleção identificado
- **Os 420 registros da base têm status “resolvido”.**
- A professora pergunta quais problemas isso traz para a interpretação da experiência de atendimento.
- A explicação das consequências será registrada na continuação.

### Registro de cobertura
- Após a identificação dos 420 chamados resolvidos, a leitura da transcrição foi interrompida pela mudança para outra janela do Teams. A retomada e eventual recuperação desse intervalo devem ser verificadas antes de considerar o resumo completo.

## Bloco 8 — aproximadamente 19h49–19h54

### Fechamento do exercício
- Foi confirmado que a base representa suporte de TI interno: funcionários de uma organização abrem chamados.
- Depois de descartar interpretações iniciais e considerar o canal, o próximo passo é estabelecer uma estratégia de validação e testar melhorias.
- A professora destaca que a IA reduz o tempo gasto em código, cálculos e gráficos, liberando tempo para discutir o negócio, validar com o cliente e aplicar senso crítico.
- Mantida a orientação de 2,5 pontos para a primeira entrega; espera-se evolução da visão crítica nas próximas atividades.

### Transição de conteúdo
- A professora anuncia o início do material da aula 2 e a discussão de um projeto corporativo em que atua, atendendo a pedidos da turma por mais casos de mercado.
- Intervalo para café ainda será anunciado.

### Cobertura
- Leitura da reunião retomada. Parte do intervalo entre a identificação do viés de seleção e o fechamento da revisão ainda precisa ser recuperada da transcrição completa.
