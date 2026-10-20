# SpeakUp_Requisitos_Antonio_Figueiredo

[Índice da biblioteca](../../README.md)

> Fonte: `Vibe Coding Executivo/SpeakUp_Requisitos_Antonio_Figueiredo.docx`  
> SHA-256: `5433d46b15d8ddfe00e972b43b5f78809e7ff37f50b6bd9e133bf6a9eda91e50`  
> Conversão do DOCX com títulos, listas, tabelas e imagens incorporadas. A paginação original não é preservada.  
> Material do acervo acadêmico fornecido pelo usuário. Autoria e direitos permanecem com os titulares indicados na fonte.

---

**EXERCÍCIO INDIVIDUAL DE DISCOVERY**

**Caso Speak Up Idiomas — Levantamento de Requisitos via Entrevista Simulada**

**Aluno: Antonio Figueiredo**

Disciplina: Vibe Coding para Executivos \| FIAP

# 1. Contexto e objetivo

A Speak Up Idiomas possui mais de 800 alunos corporativos e enfrenta limitações decorrentes de processos manuais, planilhas, canais descentralizados e um sistema legado. O Discovery foi conduzido para compreender as perspectivas da operação pedagógica, do cliente corporativo e do aluno, transformando evidências da entrevista em requisitos funcionais e não funcionais rastreáveis.

Problem Statement: A Speak Up Idiomas precisa de uma forma integrada de administrar sua operação B2B, permitindo que alunos, equipe pedagógica e empresas clientes gerenciem aulas, frequência, evolução e informações contratuais com autonomia e rastreabilidade, porque o modelo atual gera retrabalho, conflitos, baixa visibilidade e riscos operacionais e de compliance.

# 2. Fluxo integrado de desenvolvimento

Design Thinking / Design Sprint (Descoberta) → Lean Startup / Lean Inception (Estratégia) → PBB — Product Backlog Building (Refinamento) → Agile / Scrum (Entrega). Neste exercício, a ênfase está na Descoberta: entender o problema antes de prescrever a solução. As evidências coletadas alimentam requisitos, priorização e futuros itens de backlog/MVP.

# 3. Registro da entrevista

## P-01

**Pergunta:** Descrevam, do início ao fim, como funciona hoje a jornada de um aluno corporativo — da entrada no programa até o acompanhamento de sua evolução — indicando onde entram planilhas, tarefas manuais, retrabalho, atrasos e os principais problemas.

**Persona(s):** Beatriz, Marina e Rodrigo

**Resposta (síntese):** Fluxo manual desde matrícula até relatório de presença no 5º dia útil; uso de Excel, baixa visibilidade do RH e comunicação informal por WhatsApp.

## P-02

**Pergunta:** Como você organiza hoje turmas, horários e alocação de professores? Quais situações mais geram conflitos ou retrabalho e o que acontece quando há troca ou ausência de professor?

**Persona(s):** Marina

**Resposta (síntese):** Planilha mestre complexa, conflitos em aulas VIP, falta de aviso ao aluno em substituições e registro manual de absenteísmo.

## P-03

**Pergunta:** Quais volumes você administra hoje — alunos, professores, turmas e aulas —, quais picos de operação existem e quais informações precisa acompanhar para avaliar ocupação e risco de evasão?

**Persona(s):** Marina

**Resposta (síntese):** Operação com 830 alunos, 120 turmas, 35 professores e cerca de 500 aulas/semana; picos em virada de mês/semestre e acompanhamento reativo de evasão.

## P-04

**Pergunta:** Como você acompanha atualmente a participação e evolução dos funcionários, quais indicadores e relatórios precisa receber, com que frequência e como usa essas informações para avaliar orçamento, compliance e ROI?

**Persona(s):** Rodrigo

**Resposta (síntese):** Necessidade de relatórios em tempo real, proficiência, comprovação de ROI e aplicação de regras de coparticipação contratual.

## P-05

**Pergunta:** Quais sistemas da empresa deveriam trocar informações com a Speak Up, quais dados precisam circular e quais regras de acesso, privacidade ou aprovação devem ser respeitadas?

**Persona(s):** Rodrigo

**Resposta (síntese):** Integrações com RH/Folha (TOTVS/SAP), SSO (Azure AD/Okta), ERP/faturamento, LGPD e controle de acesso por papéis.

## P-06

**Pergunta:** Conte como você agenda e acompanha suas aulas hoje. O que acontece quando precisa faltar, remarcar ou repor uma aula, como recebe comunicações e quais dificuldades enfrenta?

**Persona(s):** Beatriz

**Resposta (síntese):** Sistema legado lento, baixa responsividade mobile, perda de créditos por demora no WhatsApp e falta de sincronização com agendas corporativas.

## P-07

**Pergunta:** Como o aluno acompanha seu progresso e quais informações são úteis? Em quais dispositivos e situações essas informações precisam ser acessadas?

**Persona(s):** Beatriz e Marina

**Resposta (síntese):** Necessidade de visão de proficiência CEFR, histórico de tópicos, acesso mobile em até 3 cliques e histórico centralizado na troca de docentes.

## P-08

**Pergunta:** Quando algo dá errado — conflito de agenda, falta, informação incorreta, atraso de relatório ou falha de comunicação — como descobrem o problema, quem age e qual o impacto?

**Persona(s):** Beatriz, Marina e Rodrigo

**Resposta (síntese):** Aulas perdidas geram frustração, trabalho reativo da coordenação e ruídos em auditorias e no relacionamento com o RH.

## P-09

**Pergunta:** Quais expectativas são indispensáveis quanto a tempo de resposta, disponibilidade, usuários simultâneos, segurança, facilidade de uso e continuidade do serviço?

**Persona(s):** Rodrigo, Marina e Beatriz

**Resposta (síntese):** SLA de 99,5%, suporte a 3.000–5.000 usuários simultâneos, respostas em até 2 segundos, mobile-first e logs imutáveis por 12 meses.

## P-10

**Pergunta:** Quais problemas devem ser priorizados e quais resultados mensuráveis fariam vocês afirmar que o novo sistema resolveu o problema?

**Persona(s):** Beatriz, Marina e Rodrigo

**Resposta (síntese):** Prioridades: autonomia mobile e redução de faltas punitivas; automação da grade e eliminação de choques; dashboard em tempo real e faturamento em 1 clique.

# 4. Diagnóstico consolidado

- Ineficiência e retrabalho no backoffice: mais de 15 horas semanais são consumidas com planilhas de turmas, faltas e remanejamentos, com conflitos de agenda e impacto no fechamento financeiro.

- Experiência do aluno fragmentada: baixa autonomia mobile, ausência de sincronização de calendários e risco de perda de crédito por dependência de atendimento manual.

- Baixa visibilidade e risco de compliance para clientes B2B: frequência e evolução chegam tardiamente ao RH, dificultando auditoria, coparticipação e comprovação de ROI.

- Falta de integração: não há fluxo automatizado adequado entre aprendizagem, RH/Folha, identidade corporativa e faturamento.

# 5. Requisitos Funcionais

| ID | Requisito | Descrição | Critério de Aceitação | Origem |
|----|----|----|----|----|
| RF-01 | Gestão de grade e alocação | O sistema DEVE montar e conciliar a grade de horários, alocando professores conforme nível, disponibilidade e formato da turma, sem sobreposição de agendas. | Ao confirmar uma alocação, o sistema deve bloquear qualquer combinação que gere conflito de professor ou turma e apresentar alternativas disponíveis. | P-02/P-03 — Marina |
| RF-02 | Autoatendimento de agenda | O sistema DEVE permitir que o aluno autenticado agende, cancele ou remarque aulas, respeitando regras parametrizadas de antecedência e contrato. | Dada uma aula elegível, o aluno deve conseguir selecionar uma opção disponível, confirmar a alteração e visualizar imediatamente a agenda atualizada. | P-06 — Beatriz |
| RF-03 | Créditos e reposições | O sistema DEVE controlar saldo de créditos, faltas e regras de reposição por aluno e empresa cliente. | Após cancelamento/falta, o saldo deve ser atualizado automaticamente conforme a regra contratual e manter o motivo registrado. | P-06/P-08 — Beatriz |
| RF-04 | Notificações | O sistema DEVE enviar notificações de confirmação, lembrete e alteração de aula por canais configurados e calendário integrado. | Ao alterar professor ou horário, os usuários afetados devem receber aviso e a agenda sincronizada deve refletir a alteração. | P-02/P-06 — Marina/Beatriz |
| RF-05 | Presença e absenteísmo | O sistema DEVE permitir registro digital de presença, falta justificada e falta não justificada, mantendo histórico por aula. | Após a chamada, o status de cada aluno deve ficar disponível no histórico e nos relatórios autorizados sem necessidade de digitação em planilha externa. | P-01/P-02/P-04 — Marina/Rodrigo |
| RF-06 | Portal do cliente B2B | O sistema DEVE disponibilizar painel para gestores autorizados acompanharem frequência, proficiência, ocupação, alunos ativos e indicadores do programa. | O gestor de RH autenticado deve visualizar apenas dados de sua empresa e consultar indicadores atualizados sem aguardar fechamento manual mensal. | P-04/P-05 — Rodrigo |
| RF-07 | Evolução pedagógica | O sistema DEVE registrar nivelamento, evolução CEFR, tópicos ministrados e feedbacks, preservando histórico entre trocas de professor. | Ao abrir o perfil pedagógico, aluno e profissionais autorizados devem visualizar a evolução e o histórico permitido de aulas/tópicos. | P-07 — Beatriz/Marina |
| RF-08 | Faturamento e medição | O sistema DEVE consolidar aulas contratadas e realizadas para apoiar medição mensal e aprovação do faturamento pelo cliente. | O gestor autorizado deve selecionar o período, visualizar a consolidação e executar a aprovação da medição em uma única ação. | P-04/P-10 — Rodrigo |
| RF-09 | Substituição de professores | O sistema DEVE permitir remanejamento de professor em caso de ausência, sugerindo docentes disponíveis e registrando a substituição. | Ao substituir um professor, o sistema deve evitar conflito de agenda, manter o histórico da troca e notificar os alunos afetados. | P-02/P-08 — Marina |
| RF-10 | Integrações corporativas | O sistema DEVE integrar dados autorizados com sistemas corporativos de RH/Folha, identidade, ERP/faturamento e calendários. | Para uma integração configurada, o sistema deve transmitir/receber apenas os campos autorizados, registrar sucesso ou falha e permitir rastrear a operação. | P-05/P-06 — Rodrigo/Beatriz |
| RF-11 | Elegibilidade e ciclo do aluno | O sistema DEVE permitir cadastrar, ativar, pausar e inativar alunos corporativos, preservando histórico e liberando vagas quando aplicável. | Ao inativar um aluno, novos agendamentos devem ser impedidos, o histórico deve permanecer disponível a perfis autorizados e a vaga deve ser liberada conforme regra. | P-01/P-04 — Rodrigo |
| RF-12 | Auditoria | O sistema DEVE registrar alterações de agenda, abonos de faltas, substituições e mudanças manuais relevantes com usuário, data/hora e valores envolvidos. | Uma ação auditável deve gerar registro consultável por perfil autorizado e não deve apagar o histórico anterior. | P-05/P-08/P-09 — Rodrigo/Marina |

# 6. Requisitos Não Funcionais

| ID | Categoria | Descrição do Requisito | Justificativa / Origem |
|----|----|----|----|
| RNF-01 | Usabilidade | A interface do aluno deve ser mobile-first e responsiva, permitindo executar as ações principais, como reagendamento, em até 3 cliques. | P-07/P-09 — Beatriz |
| RNF-02 | Desempenho | Consultas de grade, agendamentos e carregamento de painéis devem responder em até 2 segundos nos cenários de pico definidos na entrevista. | P-09 — Rodrigo/Marina/Beatriz |
| RNF-03 | Disponibilidade | Os portais operacionais devem possuir disponibilidade mínima de 99,5% em regime 24/7. | P-09 — Rodrigo/Marina/Beatriz |
| RNF-04 | Segurança e privacidade | Dados pessoais devem ser protegidos em trânsito e em repouso, com tratamento compatível com as exigências de LGPD relatadas no Discovery. | P-05 — Rodrigo |
| RNF-05 | Controle de acesso | O sistema deve aplicar controle de acesso baseado em papéis, separando permissões de aluno, professor, coordenação, administração da escola e gestor de RH. | P-05 — Rodrigo |
| RNF-06 | Escalabilidade | A solução deve suportar crescimento até 5.000 usuários e picos simultâneos informados no Discovery sem degradação que viole o requisito de desempenho. | P-03/P-09 — Marina/Rodrigo |
| RNF-07 | Auditabilidade | Logs de operações críticas devem ser mantidos de forma imutável por pelo menos 12 meses e acessíveis somente a perfis autorizados. | P-08/P-09 — Rodrigo/Marina/Beatriz |

# 7. Priorização inicial para MVP

Com base na P-10, a primeira versão deve priorizar: (1) autonomia mobile do aluno para agenda e reposições; (2) automação da grade e prevenção de conflitos de professores; (3) registro de presença e notificações; (4) dashboard B2B em tempo próximo do real; e (5) consolidação de medição/faturamento. Essa priorização deve ser refinada em PBB/Product Backlog Building antes da implementação.

# 8. Gaps e riscos para uma próxima rodada de Discovery

- Regras de cancelamento e crédito em turmas de 3 a 5 alunos.

- Onboarding, diário de classe, contratos e pagamentos dos 35 professores.

- Estratégia e critérios de migração do histórico de 800+ alunos e das planilhas existentes.

- Métricas de qualidade pedagógica e satisfação, como CSAT/NPS.

- RTO/RPO e política de backup não foram suficientemente definidos nas respostas; não devem ser tratados como requisito confirmado sem nova evidência.

# 9. Conclusão

O Discovery evidencia que o principal risco não é apenas tecnológico, mas operacional: o crescimento da Speak Up está apoiado em processos manuais que não escalam. A entrevista produziu evidências suficientes para formular uma primeira versão rastreável de requisitos. Os requisitos acima devem seguir para refinamento, priorização e validação antes da construção do MVP, preservando o princípio central da aula: entender e validar o problema antes de acelerar a solução.

