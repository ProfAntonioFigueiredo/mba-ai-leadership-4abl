# Etapa 4.3 Campanhas de retenção

Na **Coordenação → Campanhas de Retenção**, é possível cadastrar, editar, listar, ativar/desativar e excluir campanhas de rematrícula. A preparação e a importação de churn das etapas 4.1 e 4.2 são preservadas.

## Campos e regras

Cada campanha contém nome, churn mínimo e máximo, percentual de desconto, título da oferta, mensagem com `{nome}`, datas de início e fim e status ativa ou inativa. A prévia de mensagem substitui todas as ocorrências de `{nome}` pelo primeiro nome informado para simulação, sem enviar mensagens a alunos.

- Churn: de 0 a 100, com mínimo estritamente menor que o máximo.
- Desconto: número de 0 a 100.
- Datas civis válidas; fim estritamente posterior ao início.
- Nome até 150 caracteres; título até 180; mensagem até 2.000.
- Faixa: inclui o mínimo e exclui o máximo, exceto quando o máximo é 100, caso em que 100 também pertence à campanha.
- Validade: inclui a data de início e todo o último dia informado.

A regra escolhida pelo grupo impede duas campanhas **ativas** cuja faixa de churn e período coincidam. Faixas vizinhas, como `[0,20)` e `[20,40)`, podem coexistir. A mesma faixa pode ser reutilizada em períodos separados. Se uma campanha termina em 30/11, outra campanha ativa sobreposta nessa faixa só pode começar em 01/12. Campanhas inativas podem se sobrepor, mas a ativação revalida a regra.

Na exclusão, a tela pede confirmação e identifica a campanha pelo nome. Essa operação não apaga alunos nem previsões. A auditoria do backend registra salvamentos e exclusões.

## Contagem de alunos

A listagem está ordenada por limite mínimo, limite máximo e ID. Para cada campanha, calcula quantas previsões importadas estão na faixa. A contagem inclui previsões sem cadastro nominal e independe do status ou da validade da campanha. Ela não representa ofertas exibidas, respostas de alunos ou receita, e não deve ser somada entre campanhas de períodos diferentes como se fossem pessoas únicas.

As contagens reagem às importações de churn no mesmo app. Em Supabase, **Atualizar campanhas** consulta o estado atual do banco.

## Exemplos da aula

**Carregar 5 exemplos da aula** cria os exemplos como **inativos**, usando as datas do formulário. A ação preserva exemplos já existentes com o mesmo nome e faixa, sem duplicá-los ou sobrescrever suas alterações.

| Campanha | Faixa | Desconto de referência | Previsões da aula |
| --- | --- | ---: | ---: |
| Fidelidade | 0–20% | 5% | 8.663 |
| Renove já | 20–40% | 10% | 1.925 |
| Fique com a gente | 40–60% | 15% | 972 |
| Não desista agora | 60–80% | 20% | 888 |
| Última chamada | 80–100% | 25% | 552 |

As datas iniciais sugeridas são 28/10/2026 a 27/11/2026 nesta execução, com duração de 30 dias a partir do dia corrente em São Paulo. Os percentuais são os exemplos do exercício; não são uma estimativa de eficácia, de ganho de retenção ou de custo financeiro. Não há base de mensalidades dos 13.000 alunos para calcular custo total dos descontos.

## Demonstração e Supabase

No demo, as campanhas são persistidas em `retentionCampaigns` no estado local do navegador. O carregamento dos exemplos preserva as previsões e as campanhas existentes; a lista pode ser editada normalmente pela Coordenação.

Para um Supabase conectado, aplique `supabase/migrations/202610280003_retention_campaigns.sql` após as migrações anteriores. Ela cria `campanhas_retencao`, com RLS e acesso direto revogado, e três RPCs exclusivas de administradores:

- `save_retention_campaign(p_campaign jsonb)` cria ou atualiza, inclusive o status;
- `delete_retention_campaign(p_id bigint)` exclui uma campanha existente;
- `retention_campaigns_admin_data()` lista as campanhas com contagem por faixa.

A restrição de exclusão GiST no PostgreSQL protege a regra de sobreposição também em requisições concorrentes. Uma edição conflitante falha sem alterar a campanha anterior. Os testes PGlite validam o schema, os limites, os perfis, a ativação, a edição, a exclusão e a preservação das previsões. A migração não foi aplicada remotamente nesta entrega.

## Limite desta etapa

A tela não exibe ofertas no login, não registra respostas nem aplica descontos ao financeiro. Esses comportamentos pertencem à **Etapa 4 — Oferta personalizada no login do aluno**, que usa o cadastro criado aqui.
