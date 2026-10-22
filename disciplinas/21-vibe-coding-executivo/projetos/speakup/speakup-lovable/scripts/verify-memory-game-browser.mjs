const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import assert from 'node:assert/strict';
import {VOCABULARY} from '../src/memory-game.mjs';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5175');await page.getByRole('button',{name:'Acessar portal'}).click();await page.getByRole('button',{name:/Memory Game/}).click();
 const cards=page.locator('.memory-card');assert.equal(await cards.count(),24);assert.equal(await page.locator('.memory-board > *').count(),25);assert.equal(await page.locator('.memory-card.is-open').count(),0);
 await page.setViewportSize({width:375,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('.memory-board').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),5);
 await page.setViewportSize({width:1440,height:1000});const positions=new Map();let pending=0,sawLock=false;
 for(let i=0;i<24;i++){
  await cards.nth(i).click();const word=await cards.nth(i).locator('strong').textContent();positions.set(word,i);pending++;
  if(pending===2){if(await page.locator('.memory-board').getAttribute('aria-busy')==='true'){sawLock=true;assert.equal(await page.locator('.memory-card:disabled').count(),24);await page.waitForFunction(()=>document.querySelector('.memory-board').getAttribute('aria-busy')==='false');}pending=0;}
 }
 for(const [en,pt] of VOCABULARY){const a=cards.nth(positions.get(en)),b=cards.nth(positions.get(pt));if(!(await a.getAttribute('class')).includes('is-matched')){await a.click();await b.click();}}
 assert.equal(await page.locator('.memory-card.is-matched').count(),24);assert.equal(await page.locator('.memory-score strong').textContent(),'120');assert.match(await page.locator('.memory-feedback').textContent(),/Parabéns/);assert.match(await page.locator('.memory-learning').textContent(),/concluído/);assert.ok(sawLock);
 await page.getByRole('button',{name:'Novo Jogo',exact:true}).click();assert.equal(await page.locator('.memory-card.is-open').count(),0);assert.equal(await page.locator('.memory-score strong').textContent(),'0');assert.match(await page.locator('.memory-learning').textContent(),/iniciado/);assert.deepEqual(errors,[]);
 console.log('Navegador: tabuleiro 5×5, bloqueio de erros, 12 pares, 120 pontos, painel didático, reinício e responsividade aprovados.');
}finally{await browser.close();}
