// API local da aplicação: não publica um endpoint HTTP nem altera cadastros.
export async function consultLocalStudent({user,students,id,nome=''}) {
 const reply=(status,body)=>new Response(JSON.stringify(body,null,2),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(user?.role!=='admin')return reply(403,{error:{code:'FORBIDDEN',message:'Somente a Coordenação pode consultar cadastros nominais neste modo local.'}});
 if(typeof id!=='string'||!id.trim()||id.trim().length>50||typeof nome!=='string'||nome.trim().length>150)return reply(400,{error:{code:'INVALID_INPUT',message:'Informe um ID de aluno válido.'}});
 const found=students.filter(s=>s.id_aluno===id.trim());
 if(found.length>1)return reply(409,{error:{code:'AMBIGUOUS_STUDENT',message:'Há mais de um cadastro com esse ID. Revise os dados antes de consultar.'}});
 const student=found[0];
 const normalize=value=>String(value).trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
 if(!student||(nome.trim()&&normalize(student.nome)!==normalize(nome)))return reply(404,{error:{code:'STUDENT_NOT_FOUND',message:'Aluno não encontrado para os dados informados.'}});
 return reply(200,{aluno:{id_aluno:student.id_aluno,nome:student.nome,status_matricula:student.status_matricula},disciplinas:[],mensagem:'Aluno encontrado. Não há notas cadastradas nesta aplicação.'});
}
