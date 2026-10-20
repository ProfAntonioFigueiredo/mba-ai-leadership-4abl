// Somente terminal seguro. Nunca executar no navegador ou colocar service role em VITE_*.
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
const [studentId] = process.argv.slice(2);
if (!studentId || studentId.length > 50)
  throw Error("Uso: node scripts/provision-student.mjs MATRICULA");
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
  throw Error(
    "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY somente no terminal seguro.",
  );
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const { data: student, error } = await admin
  .from("tb_aluno")
  .select("id_aluno,nome,status_matricula")
  .eq("id_aluno", studentId)
  .single();
if (error || student.status_matricula !== "Ativa")
  throw Error("Importe uma matrícula ativa antes de provisionar.");
const { data: existing } = await admin
  .from("profiles")
  .select("user_id")
  .eq("student_id", studentId)
  .maybeSingle();
if (existing)
  throw Error("Matrícula já provisionada. A senha existente foi preservada.");
const email =
  createHash("sha256").update(studentId).digest("hex") +
  "@students.speakup.invalid";
const { data, error: authError } = await admin.auth.admin.createUser({
  email,
  password: "Escola@@@",
  email_confirm: true,
});
if (authError) throw authError;
const { error: profileError } = await admin.from("profiles").insert({
  user_id: data.user.id,
  role: "student",
  name: student.nome,
  student_id: studentId,
});
if (profileError) {
  console.error(
    "Conta criada sem perfil. Corrija o vínculo no painel Auth/Profiles; a conta não tem acesso a dados.",
  );
  throw profileError;
}
console.log("Matrícula provisionada. Senha inicial definida conforme PRD.");
