// Teste opcional da interface com respostas interceptadas. Não consulta notas remotas.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const user={id:'00000000-0000-0000-0000-000000000001',email:'admin@fixture.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}};
 const jwt=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,exp:4102444800})).toString('base64url')+'.test';
 let status=200,body='{ "aluno": {"id_aluno":"001", "nome":"Aluno de teste"}, "disciplinas": [], "mensagem":"Aluno encontrado, sem notas cadastradas." }',requests=0;
 await page.route('http://127.0.0.1:59999/**',async route=>{
  const req=route.request(),url=req.url();let data;
  if(url.includes('/auth/v1/token'))data={access_token:jwt,refresh_token:'fixture-refresh',token_type:'bearer',expires_in:3600,user};
  else if(url.includes('/auth/v1/user'))data=user;
  else if(url.includes('/rest/v1/profiles'))data={user_id:user.id,role:'admin',name:'Admin fixture'};
  else if(url.includes('/rest/v1/rpc/workspace_data'))data={students:[],slots:[],bookings:[],audit:[]};
  else if(url.includes('/functions/v1/student-grades')){
   assert.deepEqual(req.postDataJSON(),{id_aluno:'001',nome:'Aluno de teste'});assert.ok(req.headers().authorization.startsWith('Bearer '));requests++;
   await route.fulfill({status,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body});return;
  }else throw Error('Rota inesperada: '+url);
  await route.fulfill({status:200,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('http://127.0.0.1:5176');await page.getByRole('button',{name:'Coordenação',exact:true}).click();
 await page.locator('input[name=identifier]').fill('admin@fixture.test');await page.locator('input[name=password]').fill('fixture-password');
 await page.getByRole('button',{name:'Acessar portal'}).click();await page.getByRole('button',{name:/API de Notas/}).click();
 await page.getByLabel('ID do aluno',{exact:true}).fill('001');await page.getByLabel('Nome completo do aluno').fill('Aluno de teste');
 await page.getByRole('button',{name:'Testar API',exact:true}).click();await page.getByRole('heading',{name:/Consulta realizada com sucesso.*200/}).waitFor();assert.equal(await page.locator('pre').textContent(),body);
 status=404;body='{"error":{"code":"STUDENT_NOT_FOUND","message":"Aluno não encontrado"}}';await page.getByRole('button',{name:'Testar API',exact:true}).click();await page.getByRole('heading',{name:/Erro na consulta.*404/}).waitFor();assert.equal(await page.locator('pre').textContent(),body);
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Baixar Documentação'}).click();const download=await downloading;assert.equal(download.suggestedFilename(),'SpeakUp-API-Notas.md');
 const stream=await download.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);const doc=Buffer.concat(chunks).toString('utf8');assert.ok(doc.includes('http://127.0.0.1:59999/functions/v1/student-grades'));assert.ok(!doc.includes('{{SUPABASE_URL}}'));
 assert.equal(requests,2);assert.deepEqual(errors,[]);console.log('Tela da API: autenticação simulada, resposta integral 200/404 e download com URL configurada aprovados.');
}finally{await browser.close();}



