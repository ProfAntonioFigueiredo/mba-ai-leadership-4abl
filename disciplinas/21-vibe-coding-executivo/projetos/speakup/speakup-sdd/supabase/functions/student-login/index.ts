import { createClient } from 'npm:@supabase/supabase-js@2';
// Configure ALLOWED_ORIGIN com o domínio exato da aplicação. Não registrar senha/corpo.
Deno.serve(async (req: Request) => {
 const origin=Deno.env.get('ALLOWED_ORIGIN');
 const headers={'Access-Control-Allow-Origin':origin||'https://invalid.invalid','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return new Response('{}',{status:405,headers});
 if(!origin||req.headers.get('origin')!==origin)return new Response('{}',{status:403,headers});
 const invalid=()=>new Response(JSON.stringify({error:'Credenciais inválidas.'}),{status:401,headers});
 try{
  const {matricula,password}=await req.json();
  if(typeof matricula!=='string'||matricula.length<1||matricula.length>50||typeof password!=='string'||password.length>128)return invalid();
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!;
  // Endereço técnico opaco e determinístico; não expõe e-mail pessoal do aluno.
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(matricula));
  const token=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  const auth=createClient(url,anon,{auth:{persistSession:false}});
  const {data,error}=await auth.auth.signInWithPassword({email:`${token}@students.speakup.invalid`,password});
  if(error||!data.session)return invalid();
  const {data:role}=await auth.rpc('current_role');
  if(role!=='student'){await auth.auth.signOut();return invalid();}
  return new Response(JSON.stringify({session:{access_token:data.session.access_token,refresh_token:data.session.refresh_token}}),{headers});
 }catch{return invalid();}
});
