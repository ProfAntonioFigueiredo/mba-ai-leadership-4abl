// Exercise the actual static reader without a server or network access.
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '..');
const {chromium} = require(path.join(root, 'disciplinas/21-vibe-coding-executivo/projetos/speakup/speakup-sdd/node_modules/@playwright/test'));
(async () => {
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.join(root, 'biblioteca/index.html')).href;
    await page.goto(url);
    await page.locator('#results li').first().waitFor();
    const total = await page.locator('#results li').count();
    // Phrase occurs in body text, not in the PRD document title.
    await page.locator('#q').fill('retrabalho');
    if (!await page.locator('#results li').count()) throw Error('Content search failed');
    await page.locator('#group').selectOption('21');
    if (!await page.locator('#results li').count()) throw Error('Discipline filter failed');
    await page.locator('#results li a').first().click();
    await page.locator('article').waitFor();
    if (!(await page.locator('article').innerText()).trim()) throw Error('Empty reader');
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(url);
    await page.locator('#results li').first().waitFor();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Mobile horizontal overflow');
    if (errors.length) throw Error(errors.join('\n'));
    console.log(JSON.stringify({documents: total, contentSearch: 'passed', disciplineFilter: 'passed', reader: 'passed', mobile: 'passed', javascriptErrors: errors}));
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode = 1;});
