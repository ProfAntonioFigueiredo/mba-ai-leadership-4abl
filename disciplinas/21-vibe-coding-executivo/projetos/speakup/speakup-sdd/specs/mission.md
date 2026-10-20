# Missão — SpeakUp Idiomas

Data: 19/10/2026. Estado: constituição proposta para revisão humana.

## Direção confirmada

Antonio escolheu **evoluir gradualmente até produção**, preservando React/Vite/Supabase e a comparação com a implementação original. O projeto é brownfield: parte do piloto existente, não de uma reconstrução independente.

Esta constituição aplica a skill local `spec-driven`, agora acessível em `../../../../../../acervo-local/originais/Vibe Coding Executivo/Spec-Driven Development with Coding Agents/codex-skills/skills/spec-driven/SKILL.md`. A implementação e o relatório anteriores foram produzidos antes de sua leitura, com um fluxo SDD genérico autorizado. Não se deve atribuir retroativamente àquela entrega a execução dos checkpoints desta skill.

## Propósito e público

Reduzir o trabalho manual de gestão da operação B2B da SpeakUp, oferecendo autoatendimento aos alunos, organização de turmas e docentes, registro de presença e visibilidade corporativa ao RH.

- Aluno: consultar, reservar, cancelar e remarcar aulas pelo portal responsivo.
- Professor: acompanhar as próprias aulas e registrar chamadas autorizadas.
- Coordenação: administrar alunos, importações, grade e operação pedagógica.
- RH: acompanhar informações autorizadas de sua empresa e, futuramente, aprovar medições contratuais.

As personas, requisitos e objetivos de negócio derivam dos Word PRD/PSS. O prompt interpretador orienta a configuração do kernel; não substitui esses requisitos nem comprova decisões de um configurador não fornecido.

## Estado de partida e evidências

O piloto inclui agenda, reservas, remarcação, cancelamento, importação, presença e indicadores parciais. A evolução existente corrigiu problemas de configuração, domínio, prévia de importação, foco do modal e contagem de ocupação por empresa.

Em `../reports/validation.json` estão os resultados anteriores: 40 verificações Node aprovadas, incluindo agrupadores, quatro cenários de navegador aprovados, build e formatação aprovados. As verificações SQL usam PGlite e identidade simulada. Não demonstram Supabase Auth/Edge reais, concorrência entre conexões, disponibilidade ou operação em produção.

## Fronteiras do produto

O PRD continua sendo a referência funcional completa. A entrega atual é um piloto parcial. Créditos, notificações reais, medição/faturamento, substituição, histórico CEFR e integrações SSO/ERP permanecem sujeitos às fases do roadmap.

Continuam fora do escopo definido nos documentos: aplicativo nativo iOS/Android, pagamento B2C por cartão, folha completa de professores, gamificação avançada e criação de cursos próprios. Hospedagem, região, orçamento e fornecedores complementares ainda não foram escolhidos.

## Princípios e limites

1. Preservar `../../speakup-lovable` como referência original e manter evidências comparáveis. Não equiparar contagem de testes a cobertura ou conformidade.
2. Definir requisitos e validação antes de novas alterações. Manter a distinção entre fato observado, decisão confirmada, proposta e pendência.
3. Usar autorização e integridade no servidor. O modo demo e o localStorage não são mecanismos de segurança multiusuário.
4. Não inventar políticas de crédito, cancelamento, preço ou retenção para preencher lacunas. A senha universal existente exige decisão explícita antes do uso real.
5. Não declarar LGPD, SLA, criptografia, escala ou acessibilidade integral atendidos com base somente em código ou testes locais.
6. Tratar specs como fonte versionável. Commits, pushes e promoções de ambiente pertencem ao responsável humano; esta constituição não os executa nem os autoriza automaticamente.
7. Revisar cada constituição e especificação antes da etapa seguinte. Mudanças relevantes de escopo exigem replanning.

## Sucesso e condição de produção

Os objetivos do PRD — redução de 80% no esforço de coordenação, mais de 90% de autoatendimento, tarefas principais em até três cliques, medição até o primeiro dia útil, resposta em até dois segundos, disponibilidade de 99,5% e suporte a 5.000 usuários ativos — são metas a validar, não resultados desta entrega.

Cada release deverá ter escopo aceito, requisitos rastreáveis, evidências apropriadas ao ambiente e limitações conhecidas. A promoção inicial requer validação de acesso entre perfis/empresas, autenticação real, regras contratuais do escopo, migração ensaiada, recuperação testada, monitoramento e avaliação operacional/de privacidade. Metodologia de carga, percentis, RPO/RTO, responsáveis e critérios de bloqueio precisam ser definidos antes desses ensaios.

## Pendências de decisão

- Política definitiva de credenciais, recuperação e primeiro acesso.
- Janela de cancelamento, expiração, créditos e exceções por contrato.
- Fórmula de medição, competência, preços e aprovação pelo RH.
- Limites de acesso da coordenação e visibilidade de turmas compartilhadas.
- Escopo mínimo do primeiro piloto real, responsáveis, orçamento, ambiente e janela de migração.
- Retenção, anonimização, restore, suporte e resposta a incidentes.

Essas pendências serão tratadas na especificação da fase correspondente; não impedem a revisão desta constituição.
