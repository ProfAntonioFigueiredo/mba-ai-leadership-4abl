"""Gera o notebook de discussão em grupo do Caderno de Hipóteses (base metrica_cx_corr_v2.csv)."""
import json
from pathlib import Path


def md(s):
    return {"cell_type": "markdown", "metadata": {}, "source": s.strip("\n")}


def code(s):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": s.strip("\n")}


cells = [
md("""
# 📓 Caderno de Hipóteses: Suporte de TI (Hands On, Correlação Estatística)
**AI Core Concepts, Aula 1** · Profª Tassiana Rugoni de Campos · FIAP MBA
**Base:** `metrica_cx_corr_v2.csv`, pesquisa interna de satisfação dos colaboradores atendidos pelo Suporte de TI.

> **Como usar:** sigam as etapas **na ordem** (igual ao template). Rodem as células de código uma a uma (**Shift+Enter**) e registrem as conclusões do grupo nas células **💬 Discussão do grupo** (clique duas vezes para editar).
> Hipótese que cai não é erro: faz parte do processo.

**Dicionário de dados**
| Campo | Descrição |
|---|---|
| Id | Identificador único da resposta |
| Age | Idade do colaborador atendido |
| Canal | Chat, Telefone ou Portal |
| Criticidade | Baixa, Media, Alta |
| Tempo_Resolucao_h | Horas entre a abertura e a resolução do chamado |
| Status_Chamado | Situação do chamado |
| e_NPS | Disposição em recomendar o suporte (0 a 10) |
| CES | Esforço para resolver o problema (1 = muito fácil, 5 = muito difícil) → **maior = pior** |
| RATINGS | Satisfação com o atendimento (1 = muito insatisfeito, 5 = muito satisfeito) |
"""),
md("""
## 00 · Identificação do grupo
| RM | Nome |
|---|---|
| | |
| | |
| | |
| | |
| | |

**Ferramenta(s) de IA usada(s):** Claude (Anthropic) + Python (pandas/seaborn)
"""),
md("""
## 01 · Hipóteses ANTES dos dados (10 min · 🚫 SEM IA)
> ⚠️ **Não rodem nenhuma célula abaixo antes de preencher esta etapa.** Usem só o dicionário de dados e a experiência de vocês como gestores. Na Etapa 4 vocês vão confrontar isso com os dados.

**Perguntas para provocar a discussão:**
- Chamados que demoram mais deixam o colaborador mais ou menos satisfeito?
- Existe um canal (Chat, Telefone, Portal) que vocês esperam ser melhor ou pior? Por quê?
- A idade do colaborador deve influenciar o quê: canal, esforço, satisfação?
- Chamados críticos devem ser mais bem ou mais mal avaliados?
- NPS, CES e RATINGS devem andar juntos?

### 💬 Discussão do grupo, Etapa 1
| # | O que esperamos encontrar | Por que acreditamos nisso |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
"""),
md("## 02 · Matriz de correlação e leituras (15 min · IA liberada)\n### 2.1 Antes da matriz, olhem os dados"),
code("""
import numpy as np, pandas as pd, matplotlib.pyplot as plt, seaborn as sns
%matplotlib inline
sns.set_theme(style='whitegrid')
pd.set_option('display.precision', 2)

df = pd.read_csv('../dados/metrica_cx_corr_v2.csv')
print(df.shape)
df.head()
"""),
code("""
# Estatística descritiva: mínimo, máximo, média, mediana (50%) e desvio padrão
df.describe(include='all').T
"""),
code("""
# O que chama atenção?
print('Valores faltantes:', df.isna().sum().sum())
print('Status_Chamado:', df.Status_Chamado.value_counts().to_dict(), '→ não varia!')
print('Idades suspeitas (Age = 0):', df.loc[df.Age == 0, 'Id'].tolist())
print('\\nCriticidade:', df.Criticidade.value_counts().to_dict())
print('Canal:', df.Canal.value_counts().to_dict())

fig, ax = plt.subplots(1, 3, figsize=(14, 3.5))
sns.histplot(df.Age, bins=20, ax=ax[0]).set_title('Idade (atenção aos zeros)')
sns.histplot(df.Tempo_Resolucao_h, bins=30, ax=ax[1]).set_title('Tempo de resolução (cauda longa)')
sns.countplot(data=df, x='e_NPS', ax=ax[2]).set_title('e_NPS')
plt.tight_layout(); plt.show()
"""),
md("""
### 💬 Discussão do grupo: o que chamou atenção nos dados?
- **Status_Chamado** é sempre "Resolvido". O que isso significa para a pesquisa? (Quem **não** teve o chamado resolvido não foi ouvido: viés de seleção.)
- **5 idades = 0**: erro de cadastro? Como tratar?
- **Tempo**: média ≈ 15,9 h × mediana ≈ 7,7 h. O que uma cauda longa indica?
- _Anotações do grupo:_
"""),
md("### 2.2 Preparação: transformar texto em números\n- `Id` (identificador) e `Status_Chamado` (constante) **saem** da matriz.\n- `Criticidade` → escala ordinal 1 (Baixa), 2 (Média), 3 (Alta).\n- `Canal` → 3 colunas 0/1 (*one-hot*).\n- `Age = 0` → tratado como ausente."),
code("""
d = df.copy()
d.loc[d.Age == 0, 'Age'] = np.nan
num = pd.DataFrame({
    'Idade': d.Age,
    'Criticidade': d.Criticidade.map({'Baixa': 1, 'Media': 2, 'Alta': 3}),
    'Tempo_Resolucao_h': d.Tempo_Resolucao_h,
    'e_NPS': d.e_NPS, 'CES': d.CES, 'RATINGS': d.RATINGS,
    'Canal_Chat': (d.Canal == 'Chat').astype(int),
    'Canal_Portal': (d.Canal == 'Portal').astype(int),
    'Canal_Telefone': (d.Canal == 'Telefone').astype(int),
})
num.head()
"""),
md("### 2.3 Matriz de correlação (Pearson): esta é a imagem para o template"),
code("""
corr = num.corr(method='pearson')
plt.figure(figsize=(10, 8))
sns.heatmap(corr, mask=np.triu(np.ones_like(corr, bool), 1), annot=True, fmt='.2f',
            cmap='RdBu_r', vmin=-1, vmax=1, square=True, cbar_kws={'label': 'r de Pearson'})
plt.title('Matriz de correlação: Suporte de TI (n = 420)')
plt.tight_layout(); plt.savefig('../entrega/graficos/01_heatmap.png', dpi=150); plt.show()
"""),
md("### 2.4 Correlações maiores que 0,4 ou menores que −0,4\n> Na coluna **Leitura** do template, escrevam **só o que o número diz**, sem explicar o porquê (ex.: *\"quando X sobe, Y tende a cair\"*)."),
code("""
LIMIAR = 0.4
canais = {'Canal_Chat', 'Canal_Portal', 'Canal_Telefone'}
pares = []
cols = list(corr.columns)
for i, a in enumerate(cols):
    for b in cols[i + 1:]:
        r = corr.loc[a, b]
        if abs(r) > LIMIAR and not ({a, b} <= canais):   # ignora Canal × Canal (artefato do one-hot)
            pares.append((a, b, round(r, 2), 'positiva' if r > 0 else 'negativa'))
rel = pd.DataFrame(pares, columns=['Variável 1', 'Variável 2', 'r', 'Sentido']).sort_values('r', key=abs, ascending=False)
rel.reset_index(drop=True)
"""),
md("""
### 💬 Discussão do grupo: colunas fora da matriz
- Quais colunas ficaram de fora e **o que elas poderiam explicar**?
- Que variáveis **não existem na base** e fariam falta? (técnico, nível N1/N2/N3, SLA, transferências, reaberturas…)
- Por que ignoramos **Canal × Canal** (ex.: Chat × Telefone = −0,58)?
- _Anotações do grupo:_
"""),
md("""
## 03 · Auditoria da IA (10 min)
Peçam à IA que interprete a matriz e sugira hipóteses. Depois, auditem cada afirmação **como se viesse de um analista júnior da squad**.

**Prompt sugerido:**
> *"Você é um analista de dados. Aplique correlação estatística (Pearson) na base metrica_cx_corr_v2.csv (pesquisa interna de satisfação do Suporte de TI). Liste as correlações maiores que 0,4 ou menores que -0,4, interprete a matriz e sugira hipóteses para o diretor de Suporte."*

**Classificação:** **Constatação** (descreve o número) · **Hipótese** (explicação a testar) · **Causal indevida** (afirma causa sem evidência).

As células abaixo ajudam a **auditar** as afirmações da IA com os dados.
"""),
md("### 🔍 Auditoria 1: \"Chamados que demoram mais deixam o colaborador mais satisfeito\" (Tempo × RATINGS = +0,42)?"),
code("""
ordem = ['Baixa', 'Media', 'Alta']; cores = dict(zip(ordem, ['#4C9F70', '#E0A030', '#C0392B']))
fig, ax = plt.subplots(1, 2, figsize=(14, 5))
sns.regplot(data=d, x='Tempo_Resolucao_h', y='RATINGS', ax=ax[0], scatter_kws={'alpha': .35}, line_kws={'color': 'black'})
ax[0].set_title(f'Visão geral: r = {d.Tempo_Resolucao_h.corr(d.RATINGS):+.2f}')
for k in ordem:
    g = d[d.Criticidade == k]
    sns.regplot(data=g, x='Tempo_Resolucao_h', y='RATINGS', ax=ax[1], color=cores[k], scatter_kws={'alpha': .35},
                label=f'{k}: r = {g.Tempo_Resolucao_h.corr(g.RATINGS):+.2f}')
ax[1].set_title('Separando por criticidade'); ax[1].legend()
plt.suptitle('Paradoxo de Simpson? A criticidade é variável omitida?', fontweight='bold')
plt.tight_layout(); plt.savefig('../entrega/graficos/02_simpson.png', dpi=150); plt.show()

pd.DataFrame({k: {'n': len(g), 'tempo médio (h)': g.Tempo_Resolucao_h.mean(),
                  'Tempo × RATINGS': g.Tempo_Resolucao_h.corr(g.RATINGS),
                  'Tempo × e_NPS': g.Tempo_Resolucao_h.corr(g.e_NPS)}
              for k, g in d.groupby('Criticidade')}).T.loc[ordem]
"""),
md("> 💡 **O que observar:** no agregado a relação é **positiva**. Dentro de **cada** criticidade ela é **negativa**. Isso é o **Paradoxo de Simpson**: é o slide \"Variável Omitida\" (QI × tempo de estudo × nota) na prática."),
md("### 🔍 Auditoria 2: \"A idade aumenta o esforço (CES)\" (Age × CES = +0,50)?"),
code("""
d['Faixa etária'] = pd.cut(d.Age, [0, 30, 45, 70], labels=['até 30', '31–45', '46+'])
fig, ax = plt.subplots(1, 2, figsize=(14, 4.5))
(pd.crosstab(d['Faixa etária'], d.Canal, normalize='index') * 100).plot(kind='bar', stacked=True, ax=ax[0], rot=0,
    color=['#3A7CA5', '#81B29A', '#E07A5F']); ax[0].set_title('Canal usado por faixa etária (%)')
d.pivot_table(index='Faixa etária', columns='Canal', values='CES').plot(kind='bar', ax=ax[1], rot=0,
    color=['#3A7CA5', '#81B29A', '#E07A5F']); ax[1].set_title('CES médio por canal e idade (maior = pior)'); ax[1].set_ylim(1, 5)
plt.tight_layout(); plt.savefig('../entrega/graficos/04_canal_idade_ces.png', dpi=150); plt.show()
print(d.groupby('Canal').Age.mean().round(1).rename('Idade média por canal'))
"""),
md("> 💡 **O que observar:** dentro do **mesmo canal**, o CES quase não muda com a idade. A idade **leva ao telefone**, e **o telefone tem mais esforço**. Age × CES é uma correlação **indireta/espúria**."),
md("### 🔍 Auditoria 3: criticidade, tempo e satisfação"),
code("""
m = d.groupby('Criticidade')[['Tempo_Resolucao_h', 'e_NPS', 'CES', 'RATINGS']].mean().loc[ordem]
fig, ax = plt.subplots(1, 3, figsize=(14, 3.8))
for a, col in zip(ax, ['Tempo_Resolucao_h', 'e_NPS', 'RATINGS']):
    a.bar(ordem, m[col], color=[cores[k] for k in ordem]); a.set_title(col)
    for i, v in enumerate(m[col]): a.text(i, v, f'{v:.1f}', ha='center', va='bottom')
plt.tight_layout(); plt.savefig('../entrega/graficos/03_criticidade.png', dpi=150); plt.show()
m
"""),
md("### 🔍 Auditoria 4: Pearson × Spearman (CES, RATINGS e e_NPS são escalas de 1 a 5, ordinais)"),
code("""
comp = rel[['Variável 1', 'Variável 2', 'r']].copy()
sp = num.corr(method='spearman')
comp['Spearman'] = [round(sp.loc[a, b], 2) for a, b in zip(comp['Variável 1'], comp['Variável 2'])]
comp['Mantém |r|>0,4?'] = comp.Spearman.abs() > LIMIAR
comp.reset_index(drop=True)
"""),
md("""
### 💬 Discussão do grupo, Etapa 3
| Afirmação da IA (resumida) | Classificação | Concordamos? Por quê? |
|---|---|---|
| | | |
| | | |
| | | |
| | | |
| | | |

**O que a IA deixou de questionar?** _(idades zeradas? Status constante? Pearson em escala ordinal? variável omitida? SLA?)_
"""),
md("""
## 04 · Caderno de hipóteses final
Confrontem a **Etapa 1** com os dados e a auditoria. Na coluna *Etapa 1*, indiquem se a hipótese **confirma**, **contradiz** ou é **nova**.

### 💬 Discussão do grupo, Etapa 4
| # | Hipótese | Correlação que sustenta | Etapa 1: confirma / contradiz / nova | Viés ou variável omitida possível | Como validaríamos |
|---|---|---|---|---|---|
| 1 | Reduzir o tempo de resolução aumenta a satisfação em todos os níveis de criticidade | Tempo × RATINGS por criticidade: −0,49 a −0,57 | | Criticidade (Paradoxo de Simpson) | Piloto de fila expressa × grupo controle |
| 2 | O Telefone gera mais esforço e menos satisfação, independentemente da idade | CES × Telefone +0,65; CES × RATINGS −0,54 | | Idade (controlada: efeito persiste) | Medir URA, espera, transferências, FCR |
| 3 | A idade define o canal, por isso "parece" aumentar o esforço | Age × Telefone +0,74; Age × CES +0,50 | | Espúria (controlando o canal, some) | CES por idade dentro do mesmo canal |
| 4 | Chamados críticos recebem atendimento diferenciado e são mais bem avaliados | Criticidade × RATINGS +0,59; × e_NPS +0,53 | | Nível do técnico (fora da base); efeito alívio | Cruzar com N1/N2/N3 e nº de atualizações |
| 5 | Chamados críticos demoram além do SLA | Criticidade × Tempo +0,89 | | Complexidade; dependência de terceiros | Comparar com o SLA por criticidade |
| 6 | RATINGS e e_NPS medem a mesma percepção | e_NPS × RATINGS +0,89 | | Mesma pessoa, mesmo momento | Pesquisa enxuta em piloto |

**Hipóteses que derrubamos e por quê:** _(ex.: "demorar deixa mais satisfeito"; "a idade aumenta o esforço")_

**Das expectativas da Etapa 1, alguma resistimos a abandonar mesmo com os dados contra?** _(viés de confirmação!)_
"""),
md("""
## 05 · Recomendação ao Diretor de Suporte
Escolham a **hipótese mais forte** e escrevam para quem vai decidir. Uma ou duas frases por item.

### 💬 Discussão do grupo, Etapa 5
- **Decisão que recomendamos:**
- **Evidência que temos (e o que ela não prova):**
- **Experimento para testar se há causa:**
- **Custo de errar** (se agirmos e for falsa / se não agirmos e for verdadeira):

> 📄 Proposta já preenchida em `../entrega/Caderno_de_Hipoteses_CX_preenchido.docx`. Usem como ponto de partida e ajustem conforme a discussão.
"""),
md("## 📊 Anexo: todos os gráficos de dispersão dos pares relevantes"),
code("""
for _, p in rel.iterrows():
    plt.figure(figsize=(6, 4))
    sns.regplot(data=num, x=p['Variável 1'], y=p['Variável 2'], x_jitter=.15, y_jitter=.15, scatter_kws={'alpha': .3})
    plt.title(f"{p['Variável 1']} × {p['Variável 2']}  (r = {p.r:+.2f})")
    plt.show()
"""),
]

nb = {"cells": cells,
      "metadata": {"kernelspec": {"name": "mba-ia", "display_name": "Python (MBA IA)", "language": "python"},
                   "language_info": {"name": "python"}},
      "nbformat": 4, "nbformat_minor": 5}
out = Path(__file__).parent.parent / "notebooks" / "Caderno_Hipoteses_Grupo.ipynb"
out.write_text(json.dumps(nb, indent=1, ensure_ascii=False))
print("salvo:", out)
