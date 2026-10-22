# Guia da turma — vamos aprender e construir juntos

Bem-vindo(a)! Este é o nosso espaço para acompanhar as aulas, experimentar ideias e compartilhar descobertas do MBA AI Leadership — turma 4ABL.

Você não precisa saber programar para participar. Uma dúvida bem explicada, uma melhoria no texto ou o relato de um teste já ajudam a turma.

**Na primeira aula, nosso objetivo é simples: acessar o material, criar sua cópia e enviar uma pequena contribuição. Você pode começar usando apenas o navegador.**

## 1. O que estamos compartilhando?

O repositório é uma pasta de estudos na internet. Ele reúne **todas as disciplinas**, com materiais de aula, exercícios, projetos e entregas. Cada projeto pode ter suas próprias instruções.

O link de entrada é:

[**Abrir o repositório da turma**](https://github.com/ProfAntonioFigueiredo/mba-ai-leadership-4abl)

Para se localizar:

| Você quer… | Onde começar |
| --- | --- |
| Conhecer as disciplinas | [Catálogo de disciplinas](disciplinas.md) |
| Ler materiais organizados para estudo | [Biblioteca](../biblioteca/README.md) |
| Encontrar o conteúdo da aula | Abra `disciplinas`, escolha a disciplina e depois `aulas` |
| Encontrar uma aplicação ou trabalho prático | Dentro da disciplina, abra `projetos` |
| Explorar o exemplo de hoje | [SpeakUp — gestão de uma escola de inglês](../disciplinas/21-vibe-coding-executivo/projetos/speakup/README.md) |

Você não precisa entender todas as pastas. A cada aula, o professor ou facilitador indicará **qual pasta abrir e qual atividade fazer**.

## 2. Cinco palavras que vamos usar

| Palavra na tela | Pense assim |
| --- | --- |
| **Repository / repositório** | A pasta completa de estudos, com um histórico das mudanças. |
| **Fork** | Sua cópia do repositório dentro da sua conta GitHub. |
| **Branch** | Um espaço de trabalho para uma atividade, dentro da sua cópia. |
| **Commit** | Um registro das alterações que você decidiu guardar. Inclui uma mensagem explicando o que mudou. |
| **Pull Request / PR** | Um pedido para a turma revisar e incorporar sua contribuição ao repositório original. |

Outra palavra importante é **main**: é o nome da versão principal. Vamos criar uma branch para cada atividade e manter a main como ponto de partida.

Nosso caminho será:

```text
Material da turma → Sua cópia (Fork) → Sua atividade (Branch)
                  → Enviar para revisão (Pull Request)
                  → Contribuição aprovada no material da turma
```

## 3. Primeiro acesso: faça uma vez

### Passo 1 — Entre no GitHub

Acesse [github.com](https://github.com), crie sua conta se ainda não tiver e entre nela. Guarde seu nome de usuário: ele será usado para identificar suas contribuições.

### Passo 2 — Abra o link da turma

[Abra o repositório](https://github.com/ProfAntonioFigueiredo/mba-ai-leadership-4abl).

Se aparecer **404**, **Not Found** ou uma mensagem de acesso, confira se entrou na conta certa e envie seu nome de usuário ao responsável pela turma. Se o repositório estiver privado, você precisará receber e aceitar o convite de acesso.

**Não precisa tentar corrigir isso com comandos. É uma questão de acesso.**

### Passo 3 — Crie sua cópia

1. Na página inicial do repositório, procure o botão **Fork**, na parte superior.
2. Clique nele e escolha sua conta como destino.
3. Mantenha o nome `mba-ai-leadership-4abl`.
4. Se aparecer a opção **Copy the main branch only**, pode deixá-la marcada: a main contém as pastas das disciplinas.
5. Clique em **Create fork**.

Confira o nome no alto da página. Agora deve aparecer algo parecido com:

```text
seu-usuario / mba-ai-leadership-4abl
```

Essa é sua cópia do repositório inteiro. Você não precisa criar um fork para cada aula.

Se o botão Fork estiver indisponível, avise o facilitador. Repositórios privados podem ter restrições de acesso ou de cópia. [Referência do GitHub sobre forks](https://docs.github.com/en/pull-requests/reference/forks).

## 4. Em cada aula: atualize e crie seu espaço de trabalho

### Passo 1 — Busque as novidades da turma

1. Abra **seu fork** no GitHub.
2. Confira se está na branch **main**.
3. Procure **Sync fork**.
4. Se houver novidades, clique em **Update branch**.

Isso traz para sua cópia as contribuições que já foram aprovadas na turma. Se aparecer uma mensagem de conflito, peça ajuda ao facilitador antes de continuar. [Como sincronizar um fork](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/syncing-a-fork).

### Passo 2 — Crie uma branch para a atividade

1. Ainda no seu fork, clique no seletor que mostra **main**, acima dos arquivos.
2. Digite um nome para sua atividade, sem espaços ou acentos.
3. Clique na opção para criar a branch a partir da **main**.

Exemplos:

```text
aula-03-ana-importacao
vibe-coding-bruno-teste-login
ai-core-carla-anotacoes
```

**Antes de editar, confira duas coisas:** no alto da página está seu usuário e no seletor está o nome da branch da atividade.

## 5. Sua primeira contribuição — pelo navegador

Vamos começar com um relato curto sobre o SpeakUp, exemplo da aula de Vibe Coding. Em outras aulas, o facilitador indicará uma pasta diferente.

### Passo 1 — Abra a pasta da atividade

Na sua branch, navegue por estas pastas:

```text
disciplinas
  → 21-vibe-coding-executivo
    → projetos
      → speakup
```

### Passo 2 — Crie um arquivo com suas observações

1. Procure **Add file** e depois **Create new file**.
2. No nome do arquivo, digite o exemplo abaixo, trocando `seu-usuario` pelo seu usuário GitHub:

```text
contribuicoes/aula-03-seu-usuario.md
```

A barra cria a pasta `contribuicoes` se ela ainda não existir. O final `.md` indica um arquivo de texto que o GitHub apresenta como uma página de leitura.

Copie este modelo e preencha com suas palavras:

```markdown
# Meu registro da aula

Nome:
Disciplina:
Data da aula:

## O que eu entendi
Escreva uma explicação curta com suas palavras.

## O que eu fiz ou testei
Descreva os passos que realmente executou.
Se apenas leu o material, registre isso aqui.

## O que aconteceu
Conte o resultado. Se possível, diga o que esperava que acontecesse.

## Minha dúvida ou sugestão
O que você gostaria de esclarecer ou melhorar?

## Uso de inteligência artificial
Qual ferramenta ajudou e o que você conferiu pessoalmente?
```

### Passo 3 — Guarde sua contribuição

1. Clique em **Commit changes**.
2. Na mensagem, escreva algo simples, por exemplo: `Adiciona minhas observações da aula de importação`.
3. Confira se a alteração será salva na branch da atividade.
4. Confirme o commit.

**Guardar no seu fork ainda não envia sua contribuição para o material original da turma. O próximo passo faz esse pedido.**

Para enviar um arquivo já pronto, a opção **Add file → Upload files** permite selecionar arquivos do computador. Use a pasta indicada para a aula e confira o nome dos arquivos antes de confirmar.

## 6. Envie sua contribuição para revisão

1. No seu fork, abra **Pull requests** e depois **New pull request**. Também pode aparecer **Compare & pull request** após salvar uma mudança.
2. Confira o destino e a origem:

| Campo | O que selecionar |
| --- | --- |
| **base repository** — quem recebe | `ProfAntonioFigueiredo/mba-ai-leadership-4abl` |
| **base** — versão que recebe | `main` |
| **head repository** — de onde vem | Seu fork, com seu nome de usuário |
| **compare** — qual atividade | A branch que você criou |

Se aparecer uma opção como **compare across forks**, use-a para escolher os dois repositórios.

3. Revise a lista de arquivos. Ela deve mostrar apenas sua contribuição para a atividade.
4. Clique em **Create pull request**.
5. Dê um título claro: `Aula 03 — Ana — observações sobre importação`.
6. Preencha o modelo que aparecer. Explique o que fez e como conferiu o resultado. Se não executou a aplicação, diga isso.
7. Confirme o envio.

Seu PR terá um endereço próprio. Compartilhe esse link com o facilitador ou no canal combinado pela turma.

**Pronto: você enviou sua contribuição.** Ela será lida antes de ser incorporada ao material principal. [Como enviar um PR de um fork](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork).

### E se pedirem ajustes?

Volte à **mesma branch**, edite o arquivo e faça outro commit. A atualização aparecerá no PR já aberto. Você não precisa criar outro pedido para corrigir a mesma atividade.

Quando aparecer **Merged**, sua contribuição foi incorporada. Antes da próxima atividade, atualize a main do seu fork pelo **Sync fork** e crie uma nova branch.

## 7. Quando a atividade envolver executar uma aplicação

Ler, escrever observações e enviar arquivos pode ser feito no navegador. Para **executar ou modificar uma aplicação**, a turma precisará preparar o computador com orientação do facilitador.

Não use **Download ZIP** como substituto do fork se pretende enviar mudanças pelo fluxo ensinado: o ZIP é útil para consultar arquivos, mas não mantém o vínculo de trabalho Git no computador.

Para uma primeira aula prática de código, sugerimos instalação acompanhada de GitHub Desktop, editor e das ferramentas exigidas pelo projeto. O GitHub Desktop oferece botões para baixar o fork e enviar alterações; o editor abre os arquivos e permite trabalhar com a IA.

### Exemplo da aula: SpeakUp

O [README do SpeakUp](../disciplinas/21-vibe-coding-executivo/projetos/speakup/README.md) apresenta duas versões da mesma aplicação. O facilitador deve informar qual será usada na atividade. Para a importação de alunos que trabalhamos hoje, a pasta é:

```text
disciplinas/21-vibe-coding-executivo/projetos/speakup/speakup-lovable
```

Depois de baixar seu fork com histórico Git e preparar as ferramentas, abra essa pasta no editor. No terminal do editor, **dentro dessa pasta**, execute um comando por vez:

```powershell
npm ci
npm run dev
```

O primeiro instala as dependências da aplicação. O segundo a inicia e mostra um endereço local. Abra o endereço indicado; mantenha o terminal em execução enquanto utiliza a aplicação. Para encerrar, volte ao terminal e pressione **Ctrl + C**.

Esses comandos são específicos de aplicações que os oferecem. Para outra disciplina ou projeto, consulte o README da pasta indicada pelo facilitador.

No SpeakUp sem configuração Supabase, você está em **demonstração local**: os dados ficam no navegador. A senha demo é `Escola@@@`; o exemplo inicial de aluno é `10045`.

Para estudar importação:

1. Abra a aplicação em demonstração e entre como **Coordenação**.
2. Abra **Importação de Alunos**.
3. Use uma planilha de exemplo fornecida para a aula.
4. Confira a prévia antes de confirmar.
5. Registre o resultado e suas dúvidas no arquivo de contribuição.

Veja [as instruções da importação](../disciplinas/21-vibe-coding-executivo/projetos/speakup/speakup-lovable/docs/importacao-alunos.md). O fork copia arquivos; **não copia um banco Supabase, contas de alunos ou um site publicado**. A conexão com banco real é uma etapa acompanhada pelo facilitador.

### Como pedir ajuda à IA

Você pode começar com este texto no editor:

> Estou estudando com a turma 4ABL e sou iniciante. Estamos trabalhando na disciplina [nome], na pasta [caminho]. Minha atividade é [objetivo]. Primeiro leia as instruções do projeto e explique, em linguagem simples, o que encontrou. Depois me ajude a fazer uma mudança pequena nessa atividade. Preserve as outras disciplinas e explique como conferir o resultado. Informe o que foi testado e o que não foi possível testar.

A IA pode ajudar a escrever e programar. Antes de enviar, leia a contribuição e confira se ela corresponde ao que você fez.

Se você alterou arquivos no computador, precisa enviá-los ao seu fork antes de abrir o PR. No GitHub Desktop, confira a branch, selecione os arquivos da atividade, escreva a mensagem do commit e use **Push origin** ou **Publish branch**. Se estiver usando o terminal, peça ao facilitador para acompanhar esse primeiro envio.

## 8. Como participar sem escrever código

Você pode contribuir de várias formas:

- Explicar um conceito com um exemplo de negócio.
- Relatar uma dificuldade de uso de uma aplicação.
- Melhorar uma instrução que ficou confusa.
- Documentar um teste que fez durante a aula.
- Sugerir uma pergunta ou um novo exercício.
- Revisar a contribuição de um colega com respeito e clareza.

Para uma dúvida rápida, use **Issues → New issue**, se essa opção estiver disponível no repositório original. Uma Issue é uma conversa sobre uma atividade, dúvida ou problema. Inclua disciplina, aula e os passos que levaram à dúvida. Se a turma usa outro canal para dúvidas, siga o combinado pelo facilitador.

## 9. Combinados da turma

- Uma branch para cada atividade. Uma contribuição pequena é mais fácil de entender e revisar.
- Trabalhe na disciplina e na pasta combinadas para a aula.
- Use seu usuário no nome de arquivos de observações individuais para não substituir o trabalho de colegas.
- Envie apenas materiais que podem ser compartilhados com a turma. Use dados fictícios nos exercícios.
- Senhas, chaves de serviços e arquivos `.env.local` ficam no seu computador.
- Ao relatar um teste, diferencie o que você executou do que apenas foi sugerido pela IA.
- Revise o pedido de contribuição antes de enviar e acolha sugestões dos colegas.

## 10. Se algo não funcionar

| O que apareceu? | O que fazer agora |
| --- | --- |
| 404 ou acesso negado | Confirme sua conta GitHub e peça ao responsável para conferir o convite. |
| Fork indisponível | Avise o facilitador para verificar as permissões. |
| Não encontro minha branch | Abra seu fork e confira o seletor acima da lista de arquivos. |
| Não aparece diferença para enviar no PR | Confira se guardou a alteração com commit e selecionou a branch correta como origem. |
| O PR mostra mudanças de outra aula | Pare e peça ajuda para separar os arquivos antes de enviar. |
| Sync fork mostra conflito | Peça ajuda para conciliar as versões. Não apague arquivos para tentar resolver. |
| `npm` não é reconhecido | O computador ainda precisa da instalação/configuração do Node.js. Peça ajuda ao facilitador. |
| Fechei a aplicação e ela parou | Execute novamente `npm run dev` na pasta do projeto e abra o endereço informado. |
| Alterei arquivos, mas não aparecem no GitHub | Falta guardar o commit e enviar as alterações do computador ao seu fork. |

Ao pedir ajuda, envie a disciplina, a pasta, o que tentou fazer e a mensagem de erro. Retire senhas e informações pessoais de imagens e textos.

## 11. Roteiro sugerido para uma aula em grupo

| Momento | Atividade |
| --- | --- |
| Abertura — 5 minutos | Facilitador apresenta a disciplina, a pasta e o objetivo. |
| Preparação — 10 minutos | Cada pessoa acessa o fork, sincroniza a main e cria sua branch. |
| Prática — 25 minutos | A turma realiza a atividade; duplas podem se ajudar. |
| Compartilhamento — 10 minutos | Cada pessoa registra o resultado e envia seu PR. |
| Conversa — 10 minutos | A turma revisa algumas contribuições e registra aprendizados. |

Na primeira aula, reserve tempo extra para contas e acesso. O exemplo de contribuição pelo navegador é suficiente para praticar todo o ciclo antes de instalar ferramentas.

## Mensagem para compartilhar com a turma

> Pessoal, vamos usar este repositório para acompanhar todas as disciplinas e construir nossos aprendizados juntos. Não é necessário saber programar para começar: dá para contribuir com observações, dúvidas, testes e melhorias nos materiais. A cada aula vamos indicar a pasta e a atividade. Primeiro acessem o guia, criem sua conta GitHub e façam sua cópia pelo botão Fork. Se o acesso não abrir, enviem seu usuário ao facilitador. Guia: https://github.com/ProfAntonioFigueiredo/mba-ai-leadership-4abl/blob/main/docs/guia-da-turma.md

## Para o responsável pela turma

Antes de enviar o convite geral:

1. Publique as alterações que a turma deverá utilizar. Arquivos salvos apenas no seu computador não aparecem nos forks dos colegas.
2. Confira a visibilidade atual do repositório. O README o descreve como privado; esta documentação não alterou essa configuração.
3. Se estiver privado, convide os colegas e acompanhe a aceitação. Faça um teste de acesso e fork com uma pessoa antes da aula.
4. Se houver política que bloqueia forks, verifique as opções da conta/organização. Não é necessário tornar o conteúdo público para seguir este guia. [Regras de acesso e forks do GitHub](https://docs.github.com/en/pull-requests/reference/forks).
5. Indique para cada aula o link da pasta, o objetivo e onde os alunos devem colocar suas contribuições.
6. Na primeira rodada, acompanhe o exemplo pelo navegador antes de pedir mudanças em código.
7. Separe um momento para revisar os PRs e incorporar os aprovados. O merge é a ação que une a contribuição ao repositório principal.
8. Para registrar novos materiais, atualizar o catálogo ou reorganizar pastas, consulte [as instruções de manutenção](../CONTRIBUTING.md).

Configurações de acesso, convites e publicação continuam sob responsabilidade do proprietário. Este guia foi criado nos arquivos locais; o link compartilhável funcionará depois que ele for publicado no GitHub.
