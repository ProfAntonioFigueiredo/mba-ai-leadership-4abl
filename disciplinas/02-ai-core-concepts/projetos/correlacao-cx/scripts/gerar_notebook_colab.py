"""Gera Caderno_Hipoteses_Colab.ipynb: versão colaborativa (Google Colab) do notebook guiado.

- A base metrica_cx_corr_v2.csv vai EMBUTIDA no notebook (um único arquivo, roda em qualquer lugar).
- Acrescenta instruções de colaboração, registro de contribuições e assinatura de cada integrante.
"""
import json
import uuid
from pathlib import Path

BASE = Path(__file__).parent.parent
nb = json.loads((BASE / "notebooks" / "handson_correlacao.ipynb").read_text())
csv = (BASE / "dados" / "metrica_cx_corr_v2.csv").read_text().strip()


def md(s):
    return {"cell_type": "markdown", "id": uuid.uuid4().hex[:8], "metadata": {}, "source": s.strip("\n")}


src = lambda c: "".join(c["source"]) if isinstance(c["source"], list) else c["source"]

# 1) Célula de preparação: sem checagem de OneDrive, base embutida, pasta de saída criada
for c in nb["cells"]:
    s = src(c)
    if c["cell_type"] == "code" and "d = pd.read_csv('../dados/metrica_cx_corr_v2.csv')" in s:
        s = s.replace(
            "import sys\nprint('Python em uso:', sys.executable)\nif 'CloudStorage' in sys.executable:\n"
            "    print('⚠️ Este kernel está dentro do OneDrive e pode travar. Troque o kernel (canto superior direito) para '\n"
            "          '\"Python (MBA IA)\" ou ~/AulasMBA/.venv/bin/python')\n\n", "")
        s = s.replace("import numpy as np,", "import io, os\nimport numpy as np,")
        s = s.replace("d = pd.read_csv('../dados/metrica_cx_corr_v2.csv')",
                      "# Base metrica_cx_corr_v2.csv embutida (não precisa subir nenhum arquivo)\n"
                      f"CSV = '''{csv}'''\n"
                      "d = pd.read_csv(io.StringIO(CSV))\n"
                      "os.makedirs('entrega', exist_ok=True)")
        c["source"] = s
    elif c["cell_type"] == "markdown" and s.startswith("## ⚙️ 0 · Preparação"):
        c["source"] = "## ⚙️ 0 · Preparação\n▶️ **Cada integrante** roda esta célula ao abrir o notebook (no Colab, cada pessoa tem o seu próprio ambiente de execução)."

# no Colab os gráficos vão para a pasta local "entrega/"
for c in nb["cells"]:
    c["source"] = src(c).replace("../entrega/graficos/", "entrega/")

# 2) Instruções de colaboração logo após o título
colab = md("""
## 🤝 Como o grupo trabalha junto neste notebook
**Plataforma:** Google Colab (edição simultânea, como um Google Docs).

1. **Quem cria:** acesse [colab.research.google.com](https://colab.research.google.com) → **Arquivo → Fazer upload de notebook** → envie este arquivo.
2. **Compartilhar:** botão **Compartilhar** (canto superior direito) → adicione os e-mails do grupo como **Editor**.
3. **Cada integrante:** abre o link, roda a célula **0 · Preparação** e depois as células de código que quiser (cada um tem o próprio ambiente de execução; **o texto das respostas é compartilhado em tempo real**).
4. **Divisão sugerida:** cada pessoa responde uma etapa, e **todos revisam tudo** antes de assinar. Registrem na tabela **"Contribuições"** no final.
5. **Comentários:** selecione uma célula → ícone 💬 para discutir sem apagar o texto do colega.
6. **Histórico:** Arquivo → Histórico de revisões (dá para desfazer).

> ⚠️ **Etapa 1 é SEM IA** (regra da professora). Façam juntos, numa chamada, antes de rodar as análises.
> ⚠️ **No Colab, desative o assistente de IA (Gemini) durante a Etapa 1.**
""")
nb["cells"].insert(1, colab)

# 3) Antes da assinatura: registro de contribuições + como entregar
idx = next(i for i, c in enumerate(nb["cells"]) if src(c).startswith("## ✍️ Assinatura do caderno"))
contrib = md("""
## 👥 Contribuições do grupo
| Integrante | RM | Etapas em que contribuiu | Revisei o caderno completo? (✅) |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |
""")
entrega = md("""
## 📤 Como entregar (PDF + notebook)
1. **Rodar tudo:** Ambiente de execução → **Executar tudo** (para os gráficos aparecerem no arquivo).
2. **Notebook:** Arquivo → **Fazer download → Baixar .ipynb**.
3. **PDF do notebook:** Arquivo → **Imprimir** → *Salvar como PDF*.
4. **PDF do template:** copiem as respostas para o `Caderno de Hipóteses.docx`, colem a imagem `entrega/01_heatmap.png` (painel 📁 à esquerda → clique com o botão direito → Baixar) e exportem em PDF.
5. **Portal:** subam o PDF (e o .ipynb, se a professora permitir anexos extras) com os **RMs separados por vírgula**.
""")
nb["cells"][idx:idx] = [contrib, entrega]

nb["metadata"] = {"kernelspec": {"name": "python3", "display_name": "Python 3", "language": "python"},
                  "language_info": {"name": "python"}, "colab": {"provenance": [], "toc_visible": True}}
out = BASE / "notebooks" / "Caderno_Hipoteses_Colab.ipynb"
out.write_text(json.dumps(nb, indent=1, ensure_ascii=False))
print("salvo:", out, f"({out.stat().st_size/1024:.0f} KB)")
