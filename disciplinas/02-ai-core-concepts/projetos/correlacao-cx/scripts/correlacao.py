"""Hands On - Correlação Estatística (AI Core Concepts, Aula 1).

Uso:  ../../.venv/bin/python correlacao.py <base.csv|base.xlsx> [aba] [limiar]

Gera em ./saida/:
  - matriz_correlacao.csv        matriz de Pearson de todas as variáveis numéricas
  - heatmap_correlacao.png       mapa de calor da matriz
  - correlacoes_relevantes.csv   pares com r > limiar ou r < -limiar (padrão 0.4)
  - dispersao_*.png              gráfico de dispersão de cada par relevante
  - resumo.md                    perfil da base + pares relevantes, base do caderno de hipóteses
"""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


def carregar(caminho: Path, aba=None) -> pd.DataFrame:
    if caminho.suffix.lower() in (".xlsx", ".xls"):
        return pd.read_excel(caminho, sheet_name=aba or 0)
    # tenta separadores comuns em bases brasileiras
    for sep in (",", ";", "\t"):
        df = pd.read_csv(caminho, sep=sep, encoding_errors="replace")
        if df.shape[1] > 1:
            return df
    return df


def forca(r: float) -> str:
    a = abs(r)
    if a >= 0.9:
        return "muito forte"
    if a >= 0.7:
        return "forte"
    if a >= 0.5:
        return "moderada"
    return "moderada-fraca"


def main():
    caminho = Path(sys.argv[1])
    aba = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "-" else None
    limiar = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
    saida = Path(__file__).parent / "saida"
    saida.mkdir(exist_ok=True)

    df = carregar(caminho, aba)
    # converte colunas numéricas gravadas como texto com vírgula decimal
    for c in df.columns:
        if df[c].dtype == object:
            conv = pd.to_numeric(df[c].astype(str).str.replace(",", ".", regex=False), errors="coerce")
            if conv.notna().mean() > 0.9:
                df[c] = conv
    num = df.select_dtypes("number")
    num = num.loc[:, num.nunique() > 1]  # remove constantes

    corr = num.corr(method="pearson")
    corr.to_csv(saida / "matriz_correlacao.csv", float_format="%.3f")

    plt.figure(figsize=(max(8, len(corr) * 0.8), max(6, len(corr) * 0.7)))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdBu_r", vmin=-1, vmax=1, square=True,
                cbar_kws={"label": "Correlação de Pearson (r)"})
    plt.title(f"Matriz de correlação — destaque para |r| > {limiar}")
    plt.tight_layout()
    plt.savefig(saida / "heatmap_correlacao.png", dpi=150)
    plt.close()

    pares = []
    cols = list(corr.columns)
    for i, a in enumerate(cols):
        for b in cols[i + 1:]:
            r = corr.loc[a, b]
            if abs(r) > limiar:
                pares.append({"variavel_1": a, "variavel_2": b, "r": round(r, 3),
                              "sentido": "positiva" if r > 0 else "negativa", "forca": forca(r)})
    rel = pd.DataFrame(pares).sort_values("r", key=abs, ascending=False) if pares else pd.DataFrame(
        columns=["variavel_1", "variavel_2", "r", "sentido", "forca"])
    rel.to_csv(saida / "correlacoes_relevantes.csv", index=False)

    for _, p in rel.iterrows():
        plt.figure(figsize=(6, 4.5))
        sns.regplot(data=num, x=p.variavel_1, y=p.variavel_2, scatter_kws={"alpha": 0.5})
        plt.title(f"{p.variavel_1} × {p.variavel_2}  (r = {p.r:+.2f})")
        plt.tight_layout()
        nome = f"dispersao_{p.variavel_1}_x_{p.variavel_2}".replace(" ", "_").replace("/", "-")
        plt.savefig(saida / f"{nome}.png", dpi=130)
        plt.close()

    with open(saida / "resumo.md", "w") as f:
        f.write(f"# Resumo da base: {caminho.name}\n\n")
        f.write(f"- Linhas: {len(df)} · Colunas: {df.shape[1]} · Numéricas analisadas: {num.shape[1]}\n")
        nao_num = [c for c in df.columns if c not in num.columns]
        f.write(f"- Não numéricas (fora da correlação): {', '.join(map(str, nao_num)) or '—'}\n\n")
        f.write("## Estatística descritiva\n\n" + num.describe().T.round(2).to_markdown() + "\n\n")
        f.write(f"## Correlações com |r| > {limiar}\n\n")
        f.write(rel.to_markdown(index=False) if len(rel) else "_Nenhuma._")
        f.write("\n")

    print(open(saida / "resumo.md").read())


if __name__ == "__main__":
    main()
