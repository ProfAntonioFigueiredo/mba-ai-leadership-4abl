const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5175');
 await page.getByRole('button',{name:'Acessar portal'}).click();
 await page.getByRole('button',{name:/Dicas para melhorar o inglês/}).click();
 assert.equal(await page.locator('.english-tip-card').count(),0);
 await page.getByRole('button',{name:'Buscar dicas',exact:true}).click();
 await page.locator('.english-tip-card').first().waitFor({timeout:20000});
 assert.equal(await page.locator('.english-tip-card').count(),10);
 assert.equal(await page.locator('.english-tip-example p[lang=en]').count(),10);
 assert.equal(await page.locator('.english-tip-example p[lang="pt-BR"]').count(),10);
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Overflow em '+width);}
 await page.route('https://vibe-coding-frontend-backend.lovable.app/api/public/dicas',route=>route.abort('failed'));
 await page.getByRole('button',{name:'Atualizar dicas',exact:true}).click();
 await page.getByRole('alert').waitFor();assert.match(await page.getByRole('alert').textContent(),/Confira sua internet/);
 await page.unroute('https://vibe-coding-frontend-backend.lovable.app/api/public/dicas');
 assert.deepEqual(errors,[]);
 console.log('Navegador: API real com 10 dicas, exemplos/traduções, responsividade 390/1440px e erro amigável aprovados.');
}finally{await browser.close();}
