import { resolveBackendConfig } from "./configuration.mjs";
let config,
  configurationError = null;
try {
  config = resolveBackendConfig(import.meta.env);
} catch (error) {
  configurationError = error;
}
export { configurationError };
export let supabase = null;
export async function initializeBackend() {
  if (config?.mode !== "supabase") return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    supabase = createClient(config.url, config.key);
  } catch {
    configurationError = Error(
      "Não foi possível inicializar o backend configurado.",
    );
  }
}
export async function rpc(name, args = {}) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw Error(error.message);
  return data;
}
export async function signIn(identifier, password, student) {
  if (student) {
    const { data, error } = await supabase.functions.invoke("student-login", {
      body: { matricula: identifier, password },
    });
    if (error || !data?.session)
      throw Error(
        "Credenciais inválidas ou matrícula sem acesso provisionado.",
      );
    const { error: e } = await supabase.auth.setSession(data.session);
    if (e) throw e;
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });
    if (error) throw Error("Credenciais inválidas.");
  }
}
export async function profile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error) throw Error("Conta sem perfil provisionado.");
  return data;
}
export async function load() {
  return rpc("workspace_data");
}
