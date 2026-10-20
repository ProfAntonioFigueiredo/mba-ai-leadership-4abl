import React from "react";
export function LoginView({
  roles,
  supabase,
  loginType,
  setLoginType,
  login,
  pending,
  alert,
}) {
  return (
    <div className="login">
      <section className="story">
        <div className="brand">
          speak<span>up</span>
          <small>IDIOMAS · CORPORATE</small>
        </div>
        <div>
          <div className="eyebrow">APRENDER CONECTA POSSIBILIDADES</div>
          <h1>
            Mais fluência.
            <br />
            Menos barreiras.
          </h1>
          <p>Uma só plataforma para conectar pessoas, aulas e resultados.</p>
          <div className="story-card">
            <span className="circle">↗</span>
            <div>
              Seu próximo passo começa aqui
              <small>Aprendizado que acompanha sua rotina.</small>
            </div>
          </div>
        </div>
        <small>Inglês para transformar o seu mundo.</small>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <span className="tag">
            {supabase ? "SUPABASE CONECTADO" : "DEMONSTRAÇÃO · DADOS FICTÍCIOS"}
          </span>
          <h2>Bom ter você por aqui.</h2>
          <p>Acesse seu espaço na SpeakUp.</p>
          <div className="tabs">
            {Object.entries(roles).map(([r, n]) => (
              <button
                key={r}
                className={loginType === r ? "active" : ""}
                onClick={() => setLoginType(r)}
              >
                {n}
              </button>
            ))}
          </div>
          <form onSubmit={login}>
            <label>
              {loginType === "student" ? "Matrícula" : "E-mail corporativo"}
              <input
                name="identifier"
                key={loginType}
                required
                autoComplete="username"
                defaultValue={
                  !supabase
                    ? loginType === "student"
                      ? "10045"
                      : `${loginType}@example.com`
                    : ""
                }
              />
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                defaultValue={!supabase ? "Escola@@@" : ""}
              />
            </label>
            <button className="primary wide" disabled={pending}>
              {pending ? "Acessando…" : "Acessar portal →"}
            </button>
          </form>
          {!supabase && (
            <p className="hint">
              Explore os quatro perfis. As alterações ficam somente neste
              navegador. Senha de demonstração: Escola@@@.
            </p>
          )}
          {alert && (
            <div className="error" role="alert">
              {alert}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
