import React from "react";
import { COLUMNS, csvCell } from "../../domain.mjs";
export function ImportView({
  download,
  upload,
  pending,
  preview,
  action,
  mutate,
  setPreview,
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Uma base organizada começa aqui.</h2>
          <p>Valide os dados antes de confirmar a gravação.</p>
        </div>
        <button
          onClick={() =>
            download(
              COLUMNS.map(csvCell).join(";") + "\r\n",
              "modelo-alunos.csv",
            )
          }
        >
          Baixar modelo CSV
        </button>
      </div>
      <label
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files[0]);
        }}
      >
        <span>↥</span>
        <strong>
          Arraste aqui o arquivo Excel (.xlsx / .csv) da base de alunos ou
          clique para buscar
        </strong>
        <small>19 colunas oficiais · até 5 MB neste piloto</small>
        <input
          type="file"
          accept=".csv,.xlsx"
          aria-label="Selecionar planilha"
          disabled={pending}
          onChange={(e) => {
            upload(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </label>
      {preview && (
        <>
          <div className="stats compact">
            <div className="stat">
              <span>Novos cadastros</span>
              <strong>{preview.inserted}</strong>
            </div>
            <div className="stat">
              <span>Atualizações</span>
              <strong>{preview.updated}</strong>
            </div>
            <div className="stat">
              <span>Erros identificados</span>
              <strong>{preview.errors.length}</strong>
            </div>
          </div>
          {preview.errors.length > 0 && (
            <div className="error" role="alert">
              <strong>Corrija os erros antes de importar.</strong>
              {preview.errors.slice(0, 30).map((e, i) => (
                <p key={i}>
                  Linha {e.line} · {e.column}: {e.message}
                </p>
              ))}
              {preview.errors.length > 30 && (
                <p>Mostrando os primeiros 30 erros.</p>
              )}
            </div>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Validação</th>
                  {COLUMNS.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 20).map((s, i) => (
                  <tr
                    key={i}
                    className={
                      preview.errors.some((e) => e.line === i + 2)
                        ? "invalid"
                        : ""
                    }
                  >
                    <td>
                      {preview.errors.some((e) => e.line === i + 2)
                        ? "Erro"
                        : "Válida"}
                    </td>
                    {COLUMNS.map((c) => (
                      <td key={c}>{s[c]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">
            Prévia das primeiras 20 linhas. Todas as {preview.rows.length}{" "}
            linhas foram validadas. O lote inteiro é rejeitado quando há erros.
          </p>
          <button
            className="primary"
            disabled={pending || !!preview.errors.length}
            onClick={() =>
              action(async () => {
                await mutate(
                  "import_students",
                  { p_rows: preview.rows },
                  (s) => {
                    for (const row of preview.rows) {
                      const i = s.students.findIndex(
                        (x) => x.id_aluno === row.id_aluno,
                      );
                      i < 0 ? s.students.push(row) : (s.students[i] = row);
                    }
                  },
                  `Importação concluída com sucesso: ${preview.rows.length} alunos inseridos/atualizados`,
                );
                setPreview(null);
              })
            }
          >
            {pending ? "Processando…" : "Confirmar importação em lote"}
          </button>
        </>
      )}
    </section>
  );
}
