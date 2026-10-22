export function createGradesHandler({createClient,url,key,allowedOrigin}) {
 return async function handle(req) {
  const origin=req.headers.get('origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if(origin && origin===allowedOrigin){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='authorization, apikey, content-type, x-client-info';headers['Access-Control-Allow-Methods']='POST, OPTIONS';}
  const reply=(status,code,message)=>new Response(JSON.stringify({error:{code,message}}),{status,headers});
  if(origin && origin!==allowedOrigin)return reply(403,'ORIGIN_NOT_ALLOWED','Origem não permitida.');
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST'){headers.Allow='POST, OPTIONS';return reply(405,'METHOD_NOT_ALLOWED','Utilize POST.');}
  const authorization=req.headers.get('authorization');
  if(!authorization?.startsWith('Bearer ')||!authorization.slice(7).trim())return reply(401,'UNAUTHORIZED','Informe um token de acesso válido.');
  if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply(415,'UNSUPPORTED_MEDIA_TYPE','Envie Content-Type: application/json.');
  try {
   const client=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
   const user=await client.auth.getUser();
   if(user.error||!user.data?.user)return reply(401,'UNAUTHORIZED','Sessão inválida ou expirada.');
   const raw=await req.text();
   if(new TextEncoder().encode(raw).length>4096)return reply(413,'PAYLOAD_TOO_LARGE','Requisição limitada a 4 KB.');
   let body;try{body=JSON.parse(raw);}catch{return reply(400,'INVALID_JSON','JSON inválido.');}
   if(!body||Array.isArray(body)||typeof body.id_aluno!=='string'||typeof body.nome!=='string'||!body.id_aluno.trim()||body.id_aluno.trim().length>50||!body.nome.trim()||body.nome.trim().length>150)return reply(400,'INVALID_INPUT','Informe id_aluno e nome como textos válidos.');
   const {data,error}=await client.rpc('consult_student_grades',{p_id:body.id_aluno.trim(),p_name:body.nome.trim()});
   if(error||!data?.body||![200,400,403,404].includes(data.http_status))return reply(500,'INTERNAL_ERROR','Não foi possível consultar as notas.');
   return new Response(JSON.stringify(data.body),{status:data.http_status,headers});
  }catch{return reply(500,'INTERNAL_ERROR','Não foi possível consultar as notas.');}
 };
}
