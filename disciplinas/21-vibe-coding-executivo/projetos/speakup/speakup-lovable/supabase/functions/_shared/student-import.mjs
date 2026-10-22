// O cliente aqui carrega o JWT do administrador; service role só provisiona Auth/perfil.
export async function processStudentImport({rows, client, admin, technicalEmail}) {
 const results=[];
 const ids=new Map();for(const entry of rows)ids.set(entry?.row?.id_aluno,(ids.get(entry?.row?.id_aluno)||0)+1);
 for(const entry of rows){
  const {row,line}=entry||{};
  const result={line,id_aluno:row?.id_aluno};
  if(!row || typeof row.id_aluno!=='string' || ids.get(row.id_aluno)>1){results.push({...result,status:'rejected',reason:'Registro inválido ou ID duplicado no lote.'});continue;}
  let status;
  try {
   const {data,error}=await client.rpc('import_student_checked',{p_row:row});
   if(error)throw Error(error.message);
   status=data;
  } catch(e){results.push({...result,status:'rejected',reason:e.message});continue;}
  try {
   const email=await technicalEmail(row.id_aluno);
   const lookup=await admin.rpc('import_login_identity',{p_email:email,p_student:row.id_aluno});
   if(lookup.error)throw Error('Não foi possível verificar a conta de login.');
   let identity=lookup.data;
   if(identity?.role && (identity.role!=='student'||identity.student_id!==row.id_aluno))throw Error('Conta de login vinculada a outro perfil; revisão manual necessária.');
   if(!identity?.user_id){
    const created=await admin.auth.admin.createUser({email,password:'Escola@@@',email_confirm:true});
    if(created.error){
     // Outra importação pode ter criado a mesma conta entre leitura e criação.
     const retry=await admin.rpc('import_login_identity',{p_email:email,p_student:row.id_aluno});
     if(retry.error||!retry.data?.user_id)throw Error('Não foi possível criar a conta. Reenvie o arquivo para tentar novamente.');
     identity=retry.data;
    }else identity={user_id:created.data.user.id};
   }
   if(identity.role && (identity.role!=='student'||identity.student_id!==row.id_aluno))throw Error('Conta vinculada a outro perfil.');
   if(!identity.role){
    const profile=await admin.from('profiles').insert({user_id:identity.user_id,role:'student',student_id:row.id_aluno,name:row.nome});
    if(profile.error){
     const retry=await admin.rpc('import_login_identity',{p_email:email,p_student:row.id_aluno});
     if(retry.error||retry.data?.role!=='student'||retry.data.student_id!==row.id_aluno)throw Error('Cadastro salvo, mas vínculo de login pendente. Reenvie o arquivo.');
    }
   }
   results.push({...result,status,login:'ready'});
  }catch{
   results.push({...result,status,login:'pending',reason:'Aluno salvo; conta de login pendente. Reenvie o arquivo para tentar novamente, sem resetar senhas existentes.'});
  }
 }
 return results;
}

