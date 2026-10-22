import {createClient} from 'npm:@supabase/supabase-js@2';
import {processStudentImport} from '../_shared/student-import.mjs';
Deno.serve(async (req:Request)=>{
 const origin=Deno.env.get('ALLOWED_ORIGIN');
 const headers={'Access-Control-Allow-Origin':origin||'https://invalid.invalid','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
 const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return response({error:'Método não permitido.'},405);
 if(!origin||req.headers.get('origin')!==origin)return response({error:'Origem não permitida.'},403);
 try {
  const url=Deno.env.get('SUPABASE_URL')!,key=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authorization=req.headers.get('authorization');
  if(!authorization?.startsWith('Bearer '))return response({error:'Autenticação necessária.'},401);
  const client=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
  const {data:user,error}=await client.auth.getUser();
  if(error||!user.user)return response({error:'Sessão inválida.'},401);
  const role=await client.rpc('current_role');
  if(role.error||role.data!=='admin')return response({error:'Somente administradores.'},403);
  const text=await req.text();
  if(new TextEncoder().encode(text).length>512*1024)return response({error:'Requisição muito grande.'},413);
  const {rows}=JSON.parse(text);
  if(!Array.isArray(rows)||rows.length<1||rows.length>20)return response({error:'Envie entre 1 e 20 registros por requisição.'},400);
  const admin=createClient(url,service,{auth:{persistSession:false}});
  const technicalEmail=async(id:string)=>{const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id));return Array.from(new Uint8Array(hash)).map(v=>v.toString(16).padStart(2,'0')).join('')+'@students.speakup.invalid';};
  const results=await processStudentImport({rows,client,admin,technicalEmail});
  return response({results});
 }catch{return response({error:'Não foi possível processar a importação.'},500);}
});
