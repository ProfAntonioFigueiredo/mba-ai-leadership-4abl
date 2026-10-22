# SpeakUp — consulta de alunos por ID, sem Supabase

## Como utilizar na aula

1. Abra a aplicação atual e entre como **Coordenação**.
2. Acesse **API de Alunos**.
3. Informe o ID de um aluno já cadastrado ou importado. O nome é opcional; quando informado, precisa corresponder ao cadastro.
4. Clique em **Testar API**. A tela apresenta o status local e o JSON retornado pela função.
5. Clique em **Baixar Documentação** para guardar este documento.

O ID é texto: preserve zeros à esquerda. A consulta não modifica cadastros e não cria notas. Usa o estado atual da aplicação, persistido no navegador em `speakup-demo-v1`. Os dados iniciais de demonstração já existentes são mantidos; nenhum novo aluno é criado por esta consulta.

## Contrato da API local

Função: `consultLocalStudent({user, students, id, nome})`, disponível em `src/student-query.mjs`.

Ela recebe a identidade da sessão local, a lista de cadastros atual, o ID textual e o nome opcional. Retorna uma Promise com objeto Response. Esse objeto padroniza status e JSON, mas não representa uma requisição HTTP a um servidor.

```javascript
const response = await consultLocalStudent({
  user,                 // sessão da aplicação
  students: state.students,
  id: idInformado,
  nome: nomeInformado   // opcional; pode ser ''
});
const resultado = await response.json();
```

Resposta para um cadastro encontrado (marcadores representam valores reais do cadastro):

```json
{
  "aluno": {
    "id_aluno": "ID_DO_CADASTRO",
    "nome": "NOME_DO_CADASTRO",
    "status_matricula": "STATUS_DO_CADASTRO"
  },
  "disciplinas": [],
  "mensagem": "Aluno encontrado. Não há notas cadastradas nesta aplicação."
}
```

Não existem notas nesta atividade. A lista vazia não significa reprovação.

| Status local | Significado |
| --- | --- |
| 200 | Cadastro encontrado. |
| 400 | ID vazio, inválido ou maior que 50 caracteres; nome inválido. |
| 403 | Sessão local sem papel de Coordenação/admin. |
| 404 | ID não encontrado ou nome informado diferente do cadastro. |
| 409 | ID associado a múltiplos cadastros; revisão necessária. |

## Acesso e limites para a empresa parceira

Esta versão funciona dentro do navegador da aplicação e **não disponibiliza endereço HTTP para consulta externa**. Uma empresa não consegue consultar os cadastros do seu navegador a partir de outro computador.

O acesso nominal no modo local permanece restrito à Coordenação. O perfil de RH continua sem nova permissão para consultar nomes individuais. A verificação local de papel é didática e não equivale a autenticação de servidor, pois os dados e o código ficam no navegador.

Para uma integração entre sistemas será necessário publicar um backend com autenticação, autorização por empresa e persistência compartilhada. A implementação Supabase anterior permanece disponível para essa etapa futura; a documentação remota está em `docs/api-notas.md`. Não envie à empresa uma URL de Supabase não configurada como se fosse um serviço ativo.
