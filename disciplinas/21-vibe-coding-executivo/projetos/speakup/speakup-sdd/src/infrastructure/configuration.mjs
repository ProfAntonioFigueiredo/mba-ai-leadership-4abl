export function resolveBackendConfig(env = {}) {
  const url = String(env.VITE_SUPABASE_URL || "").trim();
  const key = String(env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();
  if (!url && !key) return { mode: "demo" };
  if (!url || !key)
    throw Error(
      "Configuração incompleta: informe URL e chave pública do Supabase.",
    );
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw Error("URL do Supabase inválida.");
  }
  if (!["https:", "http:"].includes(parsed.protocol))
    throw Error("URL do Supabase inválida.");
  if (
    parsed.protocol === "http:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)
  )
    throw Error("Use HTTPS para o Supabase remoto.");
  return { mode: "supabase", url, key };
}
