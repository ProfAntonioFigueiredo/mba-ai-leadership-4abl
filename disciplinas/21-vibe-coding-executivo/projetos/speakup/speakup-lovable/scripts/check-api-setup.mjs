import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';
export function parseEnv(text){const values={};for(const line of text.replace(/^\uFEFF/,'').split(/\r?\n/)){const m=line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);if(!m)continue;let value=m[2];if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);values[m[1]]=value;}return values;}
export function inspectConfig(env){
 const checks=[];let projectRef=null,endpoint=null;
 try{const url=new URL(env.VITE_SUPABASE_URL||'');if(url.protocol!=='https:'||!/^([a-z0-9]{20})\.supabase\.co$/.test(url.hostname)||!['','/'].includes(url.pathname)||url.search||url.hash||url.username||url.password)throw Error();projectRef=url.hostname.split('.')[0];endpoint=url.origin+'/functions/v1/student-grades';checks.push({ok:true,message:'URL do projeto Supabase hospedado válida.'});}catch{checks.push({ok:false,message:'Preencha VITE_SUPABASE_URL com a URL HTTPS do projeto Supabase hospedado.'});}
 const key=env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
 const secret=key.startsWith('sb_secret_')||key.includes('service_role');
 let jwtRole;try{jwtRole=JSON.parse(Buffer.from(key.split('.')[1]||'','base64url').toString()).role;}catch{}
 checks.push({ok:!!key&&!secret&&jwtRole!=='service_role'&&(key.startsWith('sb_publishable_')||jwtRole==='anon'),message:!key?'Preencha a chave pública/anon do frontend.':secret||jwtRole==='service_role'?'Chave privilegiada não permitida no frontend.':'Chave pública/anon: '+((key.startsWith('sb_publishable_')||jwtRole==='anon')?'formato reconhecido.':'formato não reconhecido; confira a chave no painel.')});
 try{const origin=new URL(env.ALLOWED_ORIGIN||'');if(origin.origin!==(env.ALLOWED_ORIGIN||'')||!['http:','https:'].includes(origin.protocol)||(origin.protocol==='http:'&&!['localhost','127.0.0.1','[::1]'].includes(origin.hostname)))throw Error();checks.push({ok:true,message:'Origem da aplicação válida.'});}catch{checks.push({ok:false,message:'Preencha ALLOWED_ORIGIN com a origem exata da aplicação, sem barra final (HTTPS, ou HTTP local).'});}
 return {checks,projectRef,endpoint,ready:checks.every(c=>c.ok)};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');const file=resolve(root,'.env.local');
 const env=existsSync(file)?parseEnv(readFileSync(file,'utf8')):{};
 const result=inspectConfig(env);console.log('Verificação local da API de notas — nenhuma conexão ou alteração remota.');
 if(!existsSync(file))console.log('Arquivo .env.local ainda não existe. Copie .env.example e preencha seus valores.');
 for(const c of result.checks)console.log((c.ok?'OK: ':'PENDENTE: ')+c.message);
 const linked=resolve(root,'supabase/.temp/project-ref');
 console.log('Vínculo CLI: '+(existsSync(linked)&&readFileSync(linked,'utf8').trim()===result.projectRef?'projeto compatível.':'ausente ou diferente; execute supabase link no projeto correto.'));
 if(result.endpoint)console.log('Endpoint previsto (publicação não verificada): '+result.endpoint);
 console.log('A fonte de notas reais precisa ser definida separadamente; este verificador não confirma contas, dados ou disponibilidade da API.');
 process.exitCode=result.ready?0:1;
}
