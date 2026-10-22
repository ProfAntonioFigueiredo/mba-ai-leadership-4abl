const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const spreadsheet=process.argv[2];
if(!spreadsheet)throw Error('Informe o caminho do Excel como argumento.');
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:"msedge"});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5175');
 await page.getByRole('button',{name:'Coordenação',exact:true}).click();
 await page.getByRole('button',{name:'Acessar portal'}).click();
 await page.getByRole('button',{name:/Importação de Alunos/}).click();
 await page.getByLabel('Importar Excel').setInputFiles(spreadsheet);
 await page.getByText(/50 registros/).waitFor();
 await page.getByRole('button',{name:'Confirmar Importação',exact:true}).click();
 await page.getByRole('heading',{name:'Resumo da importação'}).waitFor();
 const summary=await page.getByText(/Importados:.*Atualizados:/).textContent();
 console.log(summary);
 const info=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('speakup-demo-v1'));return {count:s.students.length,unique:new Set(s.students.map(r=>r.id_aluno)).size,student:s.students.find(r=>r.status_matricula!=='Ativa')?.id_aluno};});
 assert.equal(info.count,info.unique);
 assert.match(summary,/Importados: 50/);
 await page.getByLabel('Importar Excel').setInputFiles(spreadsheet);
 await page.getByText(/50 registros/).waitFor();await page.getByRole('button',{name:'Confirmar Importação',exact:true}).click();
 await page.getByRole('heading',{name:'Resumo da importação'}).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('speakup-demo-v1')).students.length),info.count);
 if(info.student){
  await page.getByRole('button',{name:/Sair/}).click();
  await page.getByRole('button',{name:'Aluno',exact:true}).click();
  await page.locator('input[name=identifier]').fill(info.student);
  await page.getByRole('button',{name:'Acessar portal'}).click();
  await page.getByRole('button',{name:/Minhas aulas/}).waitFor();
 }
 assert.deepEqual(errors,[]);
 console.log('Navegador: prévia real, confirmação, reimportação sem duplicados e login inativo aprovados.');
}finally{await browser.close();}



