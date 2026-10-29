# Etapa 4 Oferta personalizada no login

Ao iniciar uma sessão de aluno, a aplicação consulta a campanha de rematrícula apropriada. No Supabase, a seleção usa a identidade autenticada, o vínculo `tb_aluno.id_aluno_ml`, a previsão importada e uma campanha ativa dentro da validade. O cliente não informa a matrícula consultada nem recebe a probabilidade de churn.

## Comportamento

- A faixa inclui o limite mínimo e exclui o máximo; se o máximo for 100, inclui também 100.
- A validade considera datas civis de São Paulo, incluindo o último dia.
- Sem vínculo numérico, previsão ou campanha elegível, nada é exibido.
- A regra do grupo impede sobreposição de campanhas ativas por faixa e período. Se uma base demo inconsistente tiver mais de uma elegível, nenhuma é escolhida arbitrariamente.
- O pop-up mostra somente título, mensagem personalizada com o primeiro nome, desconto e validade. O conteúdo é renderizado como texto, sem interpretar HTML.

Os botões são **Quero garantir minha rematrícula** e **Agora não**. Eles registram, respectivamente, `aceitou` e `recusou`. Um aceite registra interesse: não efetiva contratação, cobrança, desconto financeiro, comunicação à equipe ou alteração de matrícula.

Fechar pelo X, Escape ou fora da janela mantém `sem resposta`. Nesse caso, a campanha pode reaparecer no próximo login enquanto for elegível. Após aceitar ou recusar, essa campanha não reaparece, mesmo que seus textos ou descontos sejam editados depois.

O pop-up permanece montado durante a navegação da sessão e não reaparece a cada troca de tela. O foco é levado para a janela, a navegação por Tab fica nos botões e o foco anterior é restaurado ao fechar. Uma sessão restaurada após recarregar a página também pode consultar a oferta.

## Histórico e respostas

A migração cria `public.oferta_exibida` com matrícula, ID numérico da previsão, ID da campanha, data/hora, resposta, data da resposta e cópia dos textos, desconto e validade apresentados. Não armazena a probabilidade de churn nesse histórico.

Cada consulta de login usa um UUID. Repetir a consulta com o mesmo UUID não duplica o registro. Um login posterior sem resposta cria outra exibição. Apenas uma resposta terminal é aceita por aluno e campanha. Respostas repetidas ou de outra sessão da mesma pessoa devolvem a resposta já registrada, sem sobrescrevê-la.

O histórico mantém a cópia da oferta se a campanha for excluída. Um novo aceite exige que a campanha ainda exista, esteja ativa e dentro da validade. A recusa pode ser registrada mesmo depois de uma desativação. Nenhum aluno consegue responder a uma exibição de outra matrícula.

## Demonstração

No modo local, as exibições ficam em `retentionOfferEvents`, junto ao estado da demonstração. A seleção usa somente as previsões e campanhas já cadastradas; não inventa uma campanha ativa ou uma previsão ausente. O demo compartilha armazenamento neste navegador e não representa uma fronteira de segurança entre pessoas reais. A privacidade de dados reais depende do backend autenticado.

Para experimentar, use uma campanha ativa e vigente na faixa do aluno e entre como **Aluno**. A matrícula de demonstração é `10045`, com a senha de aula já exibida na tela de acesso. Se a campanha estiver inativa, o login permanece sem oferta. As campanhas de exemplo da etapa 4.3 foram cadastradas inicialmente como inativas.

## Supabase

Aplique `supabase/migrations/202610280004_student_retention_offer.sql` após todas as migrações anteriores. A migração disponibiliza:

- `get_student_retention_offer(p_login_token uuid)`: escolhe a oferta e registra a exibição. Retorna somente `oferta_id`, `titulo_oferta`, `mensagem`, `desconto_percentual` e `validade`.
- `respond_student_retention_offer(p_offer bigint, p_response text)`: registra a resposta exclusivamente do aluno autenticado.

Ambas as RPCs exigem perfil `student`. A tabela tem RLS e acesso direto revogado. Coordenação, professor, RH, usuários sem perfil e anônimos não podem usar essas RPCs como se fossem o aluno. O risco continua restrito ao painel administrativo da etapa 4.2.

A migração foi executada nos testes PostgreSQL locais em memória via PGlite. Não foi aplicada a nenhum Supabase remoto nesta entrega.

## Validação

Os testes cobrem personalização, formato do retorno sem risco, UUID idempotente, limites de faixa, horário de São Paulo, campanhas inativas/expiradas, aceite, recusa, respostas repetidas e concorrentes, preservação do histórico, RLS e isolamento entre matrículas.
