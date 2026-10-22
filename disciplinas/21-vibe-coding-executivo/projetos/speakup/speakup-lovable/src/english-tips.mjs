export const TIPS_URL='https://vibe-coding-frontend-backend.lovable.app/api/public/dicas';
export async function fetchEnglishTips({signal,fetchImpl=fetch}={}){
 const response=await fetchImpl(TIPS_URL,{method:'GET',credentials:'omit',signal,headers:{Accept:'application/json'}});
 if(!response.ok)throw Error('Não conseguimos buscar as dicas agora. Tente novamente em instantes.');
 let data;try{data=await response.json();}catch{throw Error('O serviço de dicas respondeu em um formato inesperado. Tente novamente mais tarde.');}
 const fields=['titulo','explicacao','exemplo_en','traducao_pt','nivel'];
 if(!data||!Number.isInteger(data.total)||data.total<0||!Array.isArray(data.dicas)||data.total!==data.dicas.length||data.dicas.some(d=>!d||!Number.isInteger(d.id)||d.id<1||fields.some(k=>typeof d[k]!=='string'||!d[k].trim()))||new Set(data.dicas.map(d=>d.id)).size!==data.dicas.length)throw Error('Não foi possível interpretar as dicas recebidas. Tente novamente mais tarde.');
 return data;
}
