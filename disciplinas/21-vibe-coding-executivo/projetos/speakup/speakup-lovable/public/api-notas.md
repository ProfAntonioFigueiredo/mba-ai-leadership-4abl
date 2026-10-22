# SpeakUp — API de Consulta de Notas

Documento de integração para a empresa parceira. Versão 1.

## Endereço

`POST {{SUPABASE_URL}}/functions/v1/student-grades`

Se o endereço contiver `SEU_PROJETO`, ele ainda é um marcador: solicite à escola o endereço real antes de integrar. A URL desta função só estará disponível após a publicação no Supabase.

## O que esta API oferece

Consulta um aluno pelo ID e nome completo e retorna o nome cadastrado, as disciplinas, as notas e a situação registrada em cada disciplina. Não calcula aprovação, não transforma presença em nota e não gera informações de exemplo como se fossem reais.

O sistema analisado não possuía uma fonte de notas. A nova tabela `student_grades` começa vazia. A escola precisa conectar ou carregar as notas da fonte oficial antes de obter resultados com disciplinas. Enquanto isso, um aluno existente pode retornar `disciplinas: []`, com a mensagem de que não há notas cadastradas.

## Identificação e autorização

A escola fornece uma conta de integração individual da empresa no Supabase Auth, vinculada a um perfil `rh`, à empresa em `profiles.company_id` e a uma autorização ativa em `grade_api_access`. Não utilize a conta de um aluno, a senha compartilhada dos alunos nem a service role para integrar.

O token identifica a conta; a autorização no banco limita o acesso aos alunos associados àquela empresa em `student_companies`. Uma conta RH comum não recebe automaticamente permissão para consultar notas nominais. O administrador da escola pode consultar para validar a integração.

A escola deve informar por canal reservado: URL Supabase, chave pública/anon compatível com os exemplos abaixo, e credenciais da conta autorizada. O parceiro guarda a senha e os tokens no servidor, em armazenamento de segredos. A chave pública identifica o projeto, mas não substitui o token do usuário.

### Obter token

Envie por HTTPS:

```http
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=password
apikey: SUA_CHAVE_PUBLICA
Content-Type: application/json

{
  "email": "EMAIL_DA_CONTA_DE_INTEGRACAO",
  "password": "SENHA_INDIVIDUAL_FORNECIDA_PELA_ESCOLA"
}
```

A resposta de autenticação contém `access_token`, `refresh_token`, `expires_in` e dados do usuário. Use apenas o `access_token` no cabeçalho Bearer da consulta. Não copie tokens para logs, chamados ou URLs.

Para renovar uma sessão:

```http
POST {{SUPABASE_URL}}/auth/v1/token?grant_type=refresh_token
apikey: SUA_CHAVE_PUBLICA
Content-Type: application/json

{"refresh_token":"SEU_REFRESH_TOKEN"}
```

Guarde o novo par de tokens retornado. Se a sessão não puder ser renovada, autentique novamente. A escola pode revogar o acesso desativando a autorização da conta.

## Consulta completa

Substitua os marcadores com o ID e nome de um aluno real e autorizado. O exemplo abaixo é um modelo de requisição, não um cadastro incluído na aplicação.

```bash
curl --request POST '{{SUPABASE_URL}}/functions/v1/student-grades' \
  --header 'apikey: SUA_CHAVE_PUBLICA' \
  --header 'Authorization: Bearer SEU_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"id_aluno":"ID_REAL_DO_ALUNO","nome":"NOME_COMPLETO_CADASTRADO"}'
```

No Windows, use `curl.exe` no lugar de `curl` ou use o exemplo JavaScript a seguir. As barras de continuação acima são para shells Bash.

```javascript
const response = await fetch(`${supabaseUrl}/functions/v1/student-grades`, {
  method: 'POST',
  headers: {
    apikey: publicKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id_aluno: studentId, nome: fullName })
});
const body = await response.json();
if (!response.ok) {
  // Trate body.error.code e body.error.message sem registrar dados pessoais.
  throw new Error(body.error.message);
}
// body.aluno: ID e nome oficiais; body.disciplinas: resultados reais cadastrados.
```

### Campos de entrada

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id_aluno` | texto | Obrigatório, 1 a 50 caracteres. Preserve zeros à esquerda. |
| `nome` | texto | Obrigatório, nome completo, 1 a 150 caracteres. |

O nome é comparado sem diferenciar maiúsculas/minúsculas e ignorando espaços repetidos. Acentos continuam relevantes. ID e nome precisam corresponder ao mesmo cadastro. O nome é uma verificação de correspondência e não uma credencial.

### Resposta esperada para aluno encontrado sem notas

HTTP 200. Os marcadores abaixo representam os valores reais do cadastro, não dados criados pela API:

```json
{
  "aluno": {
    "id_aluno": "ID_REAL_DO_ALUNO",
    "nome": "NOME_COMPLETO_CADASTRADO"
  },
  "disciplinas": [],
  "mensagem": "Aluno encontrado, sem notas cadastradas."
}
```

Quando houver notas reais cadastradas, cada item de `disciplinas` terá:

| Campo | Tipo | Significado |
| --- | --- | --- |
| `disciplina` | texto | Nome da disciplina na fonte oficial. |
| `nota` | número | Nota registrada. A escala deve ser informada pela escola. |
| `situacao` | texto | Situação registrada na fonte oficial, sem cálculo pela API. |

Nesse caso, `mensagem` será `Consulta realizada com sucesso.`. A API ordena as disciplinas pelo nome. Não há notas reais disponíveis nesta entrega para fornecer uma amostra numérica verificável.

### Aluno não encontrado

HTTP 404:

```json
{
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "Aluno não encontrado para o ID e nome informados no escopo autorizado."
  }
}
```

A mesma resposta é usada para ID inexistente, nome divergente e aluno de outra empresa, sem revelar cadastros fora do escopo da conta.

### Códigos HTTP

| Código | Significado / ação |
| --- | --- |
| 200 | Consulta realizada. Lista vazia significa ausência de notas, não reprovação. |
| 400 | ID/nome inválido ou JSON malformado. Corrija a requisição. |
| 401 | Token ausente, inválido ou expirado. Renove ou refaça autenticação. |
| 403 | Conta sem autorização, autorização desativada ou origem de navegador não permitida. Solicite revisão à escola. |
| 404 | Aluno não encontrado no escopo permitido com o ID e nome fornecidos. |
| 405 | Método inválido. Utilize POST. |
| 413 | Corpo maior que 4 KB. |
| 415 | Informe `Content-Type: application/json`. |
| 500 | Falha interna. Tente novamente com espera e, se persistir, contate a escola sem enviar tokens. |

Falhas do gateway Supabase anteriores à função podem ter formato diferente. Trate primeiro o status HTTP e não suponha que toda resposta de erro terá JSON.

## Página de testes e download

Na aplicação, entre como Coordenação ou RH autorizado e abra **API de Notas**. Preencha ID e nome e clique em **Testar API**. A página mostra o status HTTP e o corpo recebido sem substituir ou fabricar os resultados. **Baixar Documentação** entrega este documento com o endereço configurado no ambiente.

No modo demo, o botão de consulta fica indisponível, pois não há uma API de notas reais configurada. A documentação continua disponível.

## Proteção dos dados

Requisições usam HTTPS e resposta `Cache-Control: no-store`. Não publique respostas com dados pessoais nem repasse tokens entre empresas. Integração de servidor não depende de Origin; para testes em navegador, a escola deve configurar `ALLOWED_ORIGIN` com a origem exata autorizada. CORS não substitui autenticação.

Cada consulta encontrada gera auditoria no banco com ator e ID do aluno. O endpoint não registra senhas, tokens ou conteúdo de notas em logs. A definição de escala, atualização de notas, retenção e eventual limite de uso deve ser combinada com a escola; esta API não presume regras acadêmicas ou SLA.
