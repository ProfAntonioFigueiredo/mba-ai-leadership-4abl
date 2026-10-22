import read from 'read-excel-file/node';
import {prepareImport} from '../src/student-import.mjs';
const file=process.argv[2];
if(!file)throw Error('Uso: node scripts/inspect-import.mjs CAMINHO_DO_EXCEL');
const matrix=await read(file);
const preview=prepareImport(matrix);
console.log(JSON.stringify({colunas:matrix[0],total:preview.entries.length,validos:preview.entries.filter(e=>!e.reasons.length).length,rejeitados:preview.entries.filter(e=>e.reasons.length).length,motivos:[...new Set(preview.entries.flatMap(e=>e.reasons))]},null,2));
