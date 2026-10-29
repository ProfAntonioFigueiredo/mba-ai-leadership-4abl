import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

// Resolve o pacote disponibilizado pelo ambiente Codex ou uma instalação externa.
const packageRoot = process.env.ARTIFACT_NODE_MODULES || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const require = createRequire(path.join(packageRoot, '__resolver__.cjs'));
const { Workbook, SpreadsheetFile } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const [inputPath, outputPath, previewPath] = process.argv.slice(2);
if (!inputPath || !outputPath) throw new Error('Uso: node exportar_previsao.mjs dados.json saida.xlsx [preview.png]');
const rows = JSON.parse(await fs.readFile(inputPath, 'utf8'));
if (!rows.length) throw new Error('Nenhum aluno para exportar.');
const ids = new Set();
for (const row of rows) {
  if (row.length !== 2 || !Number.isSafeInteger(row[0]) || row[0] <= 0 || ids.has(row[0])) throw new Error('ID inválido ou duplicado.');
  if (typeof row[1] !== 'number' || !Number.isFinite(row[1]) || row[1] < 0 || row[1] > 100 || Math.abs(row[1] * 10 - Math.round(row[1] * 10)) > 1e-8) throw new Error('Probabilidade inválida.');
  ids.add(row[0]);
}
const wb = Workbook.create();
const sheet = wb.worksheets.add('Previsao_Churn');
sheet.getRange(`A1:B${rows.length + 1}`).values = [['id_aluno', 'probabilidade_churn'], ...rows];
sheet.showGridLines = false;
sheet.getRange(`A1:B${rows.length + 1}`).format.font = { name: 'Arial', size: 11 };
sheet.getRange(`A1:B${rows.length + 1}`).format.rowHeight = 21;
sheet.getRange('A1:B1').format = { fill: '#17365D', font: { name: 'Arial', size: 11, color: '#FFFFFF', bold: true }, horizontalAlignment: 'center', verticalAlignment: 'center', rowHeight: 28 };
sheet.getRange(`A2:A${rows.length + 1}`).setNumberFormat('0');
sheet.getRange(`B2:B${rows.length + 1}`).setNumberFormat('0.0');
sheet.getRange(`A1:A${rows.length + 1}`).format.columnWidth = 16;
sheet.getRange(`B1:B${rows.length + 1}`).format.columnWidth = 29;
sheet.freezePanes.freezeRows(1);
wb.recalculate();
console.log((await wb.inspect({ kind: 'table', range: 'Previsao_Churn!A1:B6', include: 'values,formulas', tableMaxRows: 6, tableMaxCols: 2, maxChars: 1500 })).ndjson);
const xlsx = await SpreadsheetFile.exportXlsx(wb);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await xlsx.save(outputPath);
// O exportador pode gerar um diagnóstico auxiliar volumoso; ele não compõe a entrega.
await fs.rm(`${outputPath}.inspect.ndjson`, { force: true });
if (previewPath) {
  const preview = await wb.render({ sheetName: 'Previsao_Churn', range: 'A1:B12', scale: 2, format: 'png' });
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
}
console.log(`Excel gerado: ${rows.length} alunos, duas colunas numéricas.`);
