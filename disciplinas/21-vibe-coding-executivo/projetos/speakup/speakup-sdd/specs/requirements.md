# Especificação de produto e escopo
Data de referência: 19/10/2026. Fontes: PRD.md.docx, PSS.md.docx e Prompt_Interpretador_Mestre_Vibe_Coding_V1.docx. Extrações em sources/; os Word originais são a autoridade, incluindo estrutura visual não preservada na extração textual.
A skill específica solicitada não estava disponível; após autorização para prosseguir, aplicou-se um fluxo SDD explícito: fontes → requisitos → aceite → decisões → tarefas → implementação → validação.

## Versão comparável
Evolução do piloto React/Vite/Supabase existente, com os mesmos quatro perfis e interfaces. Não é uma reconstrução independente nem experimento controlado sobre produtividade de métodos. Mantém as funcionalidades de agenda, reserva, remarcação, cancelamento, importação, chamada e indicadores. Conserva contratos RPC existentes.

## Requisitos do PRD
- RF-01 P0: grade sem sobreposição de professor ou turma. Implementado no piloto; reforçar validação de datas no demo.
- RF-02 P0: reservar, cancelar e remarcar em até três cliques após login; matrícula ativa. Preservar fluxo. A senha compartilhada exigida no material permanece, com conflito registrado.
- RF-13 P0: importar CSV/XLSX nas 19 colunas, prévia e erros por linha/coluna. Implementado; alinhar limites de cliente e servidor e invalidar prévia antiga após novo upload.
- RF-05 P0: chamada digital e indicadores. Implementado com refresh após operações próprias; sincronização entre usuários continua pendente.
- RF-06 P0: RH corporativo, frequência e aprovação de medição. Parcial: aprovação depende de RF-08. Minimizar dados do RH e evitar contagens de outra empresa em turmas compartilhadas.
- RF-03 P1: créditos e expiração. Pendente de política contratual; não implementar números inventados.
- RF-04 P1: notificações/calendário. Pendente, sem provedores configurados.
- RF-08 P1: medição mensal e aprovação. Pendente de regras e integração; não simular conclusão.
- RF-09 P1: substituição automática. Pendente.
- RF-07 P2: histórico CEFR. Pendente; nível atual não equivale a histórico.
- RF-10 P2: SSO/ERP. Pendente.
- RF-12 P2: auditoria. Parcial: RPCs registram eventos e trigger impede alteração comum; retenção 12 meses e imutabilidade administrativa não demonstradas.

## Requisitos não funcionais
RNF-01: interface mobile e fluxo curto. Verificar teclado e modal, testar reserva; auditoria completa e todos os fluxos de três cliques permanecem sem certificação.
RNF-02: resposta <=2s sob pico. Sem evidência de carga; pendente.
RNF-03: disponibilidade >=99,5%. Depende de operação; pendente.
RNF-04: TLS 1.3, AES-256 e LGPD. Não inferir conformidade a partir de RLS; evidências jurídicas e operacionais pendentes.
RNF-05: papéis Aluno/Professor/Coordenação/RH. Preservar banco como autoridade, testar negativas e isolamento.
RNF-06: 5.000 usuários. workspace_data ainda retorna coleção completa autorizada; paginação cliente não demonstra escalabilidade.
RNF-07: auditoria por 12 meses. Pendente de armazenamento, retenção e restauração testados.

## Melhorias técnicas derivadas, não requisitos fictícios
ENG-01: configuração incompleta deve falhar explicitamente, sem fallback silencioso ao demo.
ENG-02: regras de calendário devem comparar instantes, aceitar offsets e rejeitar datas inválidas, capacidade fora de 1–100 e remarcação para a mesma aula.
ENG-03: importação cliente deve rejeitar mais de 5.000 linhas e idade fora do inteiro PostgreSQL; nova seleção limpa a prévia anterior.
ENG-04: modal deve receber foco, limitar Tab, fechar por Escape e restaurar foco ao acionador.
ENG-05: RH não deve obter ocupação de outras empresas em aulas compartilhadas.
ENG-06: separar domínio, aplicação, infraestrutura e apresentação sem alterar a identidade visual.
ENG-07: validações executáveis e logs reproduzíveis; CI deve executar os mesmos comandos locais.
