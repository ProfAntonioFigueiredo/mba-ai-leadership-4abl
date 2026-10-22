import test from 'node:test';
import assert from 'node:assert/strict';
import {createGradesHandler} from '../supabase/functions/_shared/grades-handler.mjs';
function setup({user=true,rpcError=false,status=200,body={aluno:{id_aluno:'001',nome:'Aluno de teste'},disciplinas:[],mensagem:'Aluno encontrado, sem notas cadastradas.'}}={}){
 const calls=[];
 const handle=createGradesHandler({url:'https://test.invalid',key:'public-test',allowedOrigin:'http://localhost:5173',createClient:()=>({auth:{getUser:async()=>user?{data:{user:{id:'fixture-user'}}}:{error:{message:'invalid'}}},rpc:async(name,args)=>{calls.push({name,args});return rpcError?{error:{message:'detalhes privados'}}:{data:{http_status:status,body}};}})});
 return {handle,calls};
}
function request({method='POST',token='test-session',body={id_aluno:'001',nome:'Aluno de teste'},type='application/json',origin}={}){
 const headers={};if(token)headers.Authorization='Bearer '+token;if(type)headers['Content-Type']=type;if(origin)headers.Origin=origin;
 return new Request('https://api.test/functions/v1/student-grades',{method,headers,...(['GET','OPTIONS'].includes(method)?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});
}
test('API exige token válido e restringe métodos',async()=>{
 assert.equal((await setup().handle(request({method:'GET'}))).status,405);
 assert.equal((await setup().handle(request({token:null}))).status,401);
 assert.equal((await setup({user:false}).handle(request())).status,401);
});
test('API valida formato sem aceitar ID numérico ou nome vazio',async()=>{
 const {handle,calls}=setup();
 for(const body of [{id_aluno:123,nome:'A'},{id_aluno:'1',nome:' '},null,[],{id_aluno:'1'.repeat(51),nome:'A'}])assert.equal((await handle(request({body}))).status,400);
 assert.equal((await handle(request({body:'{'}))).status,400);
 assert.equal((await handle(request({type:'text/plain'}))).status,415);
 assert.equal((await handle(request({body:'x'.repeat(4097)}))).status,413);
 assert.equal(calls.length,0);
});
test('API retorna corpo da RPC sem inventar notas e preserva ID textual',async()=>{
 const {handle,calls}=setup();const res=await handle(request({body:{id_aluno:' 001 ',nome:' Aluno de teste '}}));
 assert.equal(res.status,200);assert.equal(res.headers.get('Cache-Control'),'no-store');assert.deepEqual((await res.json()).disciplinas,[]);
 assert.deepEqual(calls[0],{name:'consult_student_grades',args:{p_id:'001',p_name:'Aluno de teste'}});
});
test('API preserva erro autorizado da RPC e oculta detalhes internos',async()=>{
 const body={error:{code:'STUDENT_NOT_FOUND',message:'Aluno não encontrado'}};
 const res=await setup({status:404,body}).handle(request());assert.equal(res.status,404);assert.deepEqual(await res.json(),body);
 const failed=await setup({rpcError:true}).handle(request());assert.equal(failed.status,500);assert.ok(!(await failed.text()).includes('privados'));
});
test('CORS permite somente origem configurada e consulta servidor não exige Origin',async()=>{
 const {handle}=setup();assert.equal((await handle(request({origin:'https://intruso.test'}))).status,403);
 const allowed=await handle(request({origin:'http://localhost:5173',method:'OPTIONS'}));assert.equal(allowed.status,204);assert.equal(allowed.headers.get('access-control-allow-origin'),'http://localhost:5173');
 assert.equal((await handle(request())).status,200);
});
