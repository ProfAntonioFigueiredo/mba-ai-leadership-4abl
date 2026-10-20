# Roadmap — evolução gradual até produção

Data: 19/10/2026. Direção confirmada por Antonio. Estado: proposta para revisão humana; as fases futuras não estão autorizadas para implementação apenas por constarem neste documento.

## Processo de cada fase

Antes de especificar uma fase, inspecionar o estado real e esclarecer em conjunto apenas as decisões ainda ausentes. Produzir `requirements.md`, `plan.md` com grupos numerados e `validation.md` em `specs/YYYY-MM-DD-feature-name/`. Pausar para revisão humana dos arquivos antes de implementar.

Implementar em grupos revisáveis, executar a validação aplicável e registrar aprovados, falhas, não executados e riscos residuais. Pausar após a implementação para revisão. Commit, push e promoção de ambiente são decisões humanas. Novas dependências ou automações precisam estar previstas na spec da fase que as introduzir.

Não há cronograma ou orçamento aprovado. A ordem abaixo explicita dependências; datas e responsáveis serão definidos com o escopo de cada fase. Nenhuma fase está marcada concluída por conter apenas documentação.

## Fase 0 — Constituição e enquadramento do projeto

Estado: três arquivos propostos; revisão humana pendente.

Entrega: mission.md, tech-stack.md e este roadmap. Preservar a distinção entre a evolução anterior com SDD genérico e a aplicação atual da skill específica.

Saída: responsável revisa propósito, stack, limites e ordem; alterações solicitadas são incorporadas. Depois disso, especificar a fase 1.

## Fase 1 — Consolidar a baseline e o primeiro incremento

Estado: implementação anterior disponível; formalização conforme a skill ainda pendente.

Escopo: especificar o fechamento das correções existentes, reconciliar os documentos anteriores e a matriz de aceite, atualizar a comparação com a aplicação real da skill e definir o limite do primeiro piloto real. Registrar quais testes são históricos e quais precisam ser repetidos conforme o código efetivamente mudar.

Saída: requisitos e validação datados, rastreabilidade coerente, original preservado e revisão das evidências. Não atribuir à skill checkpoints que não aconteceram antes do código existente.

## Fase 2 — Credenciais e primeiro acesso

Dependência: fase 1 e decisão do responsável sobre senha fixa versus inicial.

Escopo: política de credenciais, provisionamento, recuperação, sessão, revogação e limitação de tentativas. Preservar matrícula como login sem usar exposição de e-mail como atalho.

Saída: política aceita e cenários negativos definidos e verificados; nenhuma dependência de senha universal sem resolução explícita para usuários reais. Não confundir manter a senha no demo com aprová-la para produção.

## Fase 3 — Integração real em desenvolvimento

Dependência: fase 2 e acesso a ambiente de desenvolvimento autorizado.

Escopo: Auth/Edge, migrações, quatro perfis, duas empresas e professores distintos. Verificar chamadas diretas de API, matrícula inativa, expiração/revogação e privacidade de aulas compartilhadas.

Saída: evidências ponta a ponta do ambiente real e ensaio das migrações com reversão definida. PGlite permanece como teste local complementar.

## Fase 4 — Reservas sob concorrência

Dependência: fase 3.

Escopo: duas sessões disputando última vaga, reservas simultâneas do mesmo aluno, remarcações concorrentes e cancelamentos. Investigar ordem de locks e tratamento de falhas a partir de reprodução, sem presumir defeitos ou ausência deles.

Saída: invariantes de lotação, conflito e atomicidade demonstradas em conexões independentes; falhas e comportamento de recuperação documentados.

## Fase 5 — Consultas e paginação no servidor

Dependência: fase 3; preservar invariantes da fase 4.

Escopo: recortes temporais, filtros e paginação autorizados, índices baseados em consultas medidas e compatibilidade da interface. Definir previamente o significado de carga e das metas RNF-02/RNF-06.

Saída: ausência de coleções desnecessariamente completas nos fluxos escolhidos e medições reproduzíveis com distribuição representativa. Não declarar 5.000 usuários validados por testar somente um lote de importação de 5.000 linhas.

## Fase 6 — Presença e indicadores entre usuários

Dependência: fase 5.

Escopo: sincronização de chamada e indicadores entre professor, coordenação e RH, estratégia de atualização, erros e recuperação. Validar opções de realtime/polling na spec antes de escolher uma.

Saída: atualizações observadas entre sessões sem vazamento corporativo; sem confundir recarregar após a própria mutação com atualização multiusuário.

## Fase 7 — Créditos e cancelamento contratual

Dependência: fases 3–4 e política de negócio confirmada.

Escopo: RF-03, janela de cancelamento por modalidade, saldo, expiração, reposição e exceções; registrar efeitos transacionais nas reservas.

Saída: cenários de contrato, bordas de horário/fuso e ausência de consumo/devolução duplicados verificados. Valores e prazos não serão inventados pelo agente.

## Fase 8 — Medição mensal

Dependência: fase 7 e decisões de preço, competência e aulas faturáveis.

Escopo: RF-08, geração de medição, reprocessamento, conciliação e evidência de origem dos valores. Definir contratos de exportação sem assumir uma integração financeira já existente.

Saída: resultados conciliados em cenários de referência, sem duplicação financeira ou uso de aritmética monetária aproximada.

## Fase 9 — Aprovação de medição pelo RH

Dependência: fase 8.

Escopo: completar a parte financeira de RF-06, com autorização por empresa, estados, revisão e auditoria. Resolver a dependência do RF-06 P0 em relação ao RF-08 P1 antes de prometer o portal completo.

Saída: somente o RH autorizado aprova a versão correta da medição e o histórico permite conferir alterações.

## Fase 10 — Notificações e calendário

Dependência: regras de agenda/crédito estáveis; fornecedor e orçamento escolhidos antes de integração.

Escopo: RF-04 em fatias: primeiro lembretes/alterações; depois calendário. Definir idempotência, tratamento de falhas, conteúdo mínimo e preferências.

Saída: entregas reais verificadas em ambiente de teste, sem duplicação ou divulgação indevida de dados. Integrações não testadas não serão apresentadas como concluídas.

## Fase 11 — Preparar e executar piloto controlado

Dependência: integração, concorrência e consultas validadas; escopo de lançamento confirmado na fase 1. Se funções das fases 6–10 forem excluídas do piloto, registrar a redução explicitamente; não declarar todo o PRD atendido.

Fatias a especificar e revisar separadamente:

1. Operação: logs sem segredos/PII excessiva, métricas, alertas, suporte e resposta a incidentes.
2. Recuperação e dados: backups/restauração, migração ensaiada, plano de reversão e retenção; definir e medir RPO/RTO.
3. Aceite: acessibilidade com tarefas reais, privacidade, segurança, carga representativa e restrições conhecidas.
4. Promoção: checklist de release, responsáveis e decisão humana sobre ambiente, custo e janela; entrada progressiva dos usuários e acompanhamento.

Saída: pacote de evidências por fatia e decisão explícita de go/no-go. Aprovação desta constituição não autoriza implantação nem gasto. Produção controlada não equivale a comprovação imediata do SLA mensal.

## Fase 12 — Expansão e evolução contínua

Dependência: resultados e necessidades observadas no piloto.

Tratar RF-09 (substituição), RF-07 (histórico CEFR) e RF-10 (SSO/ERP) como specs próprias, com prioridades confirmadas pelo responsável. A auditoria RF-12 e RNF-07 evolui junto de cada fluxo e exige política operacional; não deve ser adiada integralmente a esta fase.

Saída de cada incremento: requisito delimitado, validação, revisão humana e atualização da memória do projeto. Mudanças de contrato, stack, hospedagem, carga ou política de acesso acionam replanning.

## Próxima ação após a revisão

Especificar a fase 1 em diretório datado, usando os arquivos anteriores como evidência de brownfield. A implementação existente fica preservada enquanto a constituição é revisada. O relatório comparativo histórico continuará identificando o método utilizado na execução original até sua atualização especificada na fase 1.
