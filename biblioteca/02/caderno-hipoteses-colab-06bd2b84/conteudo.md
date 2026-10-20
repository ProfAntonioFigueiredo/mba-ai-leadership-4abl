# Caderno_Hipoteses_Colab

[Índice da biblioteca](../../README.md)

> Fonte: `Aulas/AI-Core-Concepts/04_Hands_On_Correlacao/notebooks/Caderno_Hipoteses_Colab.ipynb`  
> SHA-256: `06bd2b84be61028c5416b9d6553da6f383ac89134a50b0634724c06b87f5cc6b`  
> Células e saídas textuais já gravadas. O notebook não foi executado na conversão.  
> Material do acervo acadêmico fornecido pelo usuário. Autoria e direitos permanecem com os titulares indicados na fonte.

---

# 📓 Hands On guiado: Caderno de Hipóteses (Suporte de TI)
**AI Core Concepts, Aula 1** · Profª Tassiana Rugoni de Campos · FIAP MBA
**Base:** `metrica_cx_corr_v2.csv`, pesquisa interna de satisfação dos colaboradores atendidos pelo Suporte de TI (420 respostas).

### Como usar este notebook
Ele segue **exatamente a ordem do template "Caderno de Hipóteses.docx"**. Em cada pergunta:

| Ícone | O que é |
|---|---|
| 📋 | A pergunta do template |
| ▶️ | Código: rode com **Shift+Enter** e veja o gráfico ou a tabela |
| 💡 | **Insight**: o conceito por trás, para você aprender a ler o resultado |
| ✍️ | **Sua resposta**: escreva com as suas palavras (clique duas vezes na célula) |
| 🔎 | Referência: **leia só depois de responder**, para comparar |

> *"Quem assina o caderno de hipóteses é você, não o LLM."* Use as referências para checar o raciocínio, não para copiar.
> No fim, copie as suas respostas para o Word, exporte em PDF e assine.

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

## ⚙️ 0 · Preparação
▶️ **Cada integrante** roda esta célula ao abrir o notebook (no Colab, cada pessoa tem o seu próprio ambiente de execução).

```python
import io, os
import numpy as np, pandas as pd, matplotlib.pyplot as plt, seaborn as sns
from IPython.display import display, Markdown
%matplotlib inline
sns.set_theme(style='whitegrid', font_scale=1.05)
pd.set_option('display.precision', 2)

LIMIAR = 0.4
ORDEM_CRIT = ['Baixa', 'Media', 'Alta']
CORES_CRIT = dict(zip(ORDEM_CRIT, ['#4C9F70', '#E0A030', '#C0392B']))
CORES_CANAL = {'Chat': '#3A7CA5', 'Portal': '#81B29A', 'Telefone': '#E07A5F'}

def forca(r):
    a = abs(r)
    return 'muito forte' if a >= .9 else 'forte' if a >= .7 else 'moderada' if a >= .5 else 'moderada-fraca' if a >= .4 else 'fraca' if a >= .2 else 'desprezível'

def explorar(x, y, por=None, dados=None):
    """Ferramenta de investigação: mostra a correlação x × y no geral e, opcionalmente, DENTRO de cada grupo `por`.
    Ex.: explorar('Tempo_Resolucao_h', 'RATINGS', por='Criticidade')"""
    d0 = dados if dados is not None else d
    r = d0[x].corr(d0[y])
    ncols = 2 if por else 1
    fig, ax = plt.subplots(1, ncols, figsize=(6.5 * ncols, 4.3), squeeze=False)
    sns.regplot(data=d0, x=x, y=y, ax=ax[0, 0], x_jitter=.15, y_jitter=.15, scatter_kws={'alpha': .3}, line_kws={'color': 'black'})
    ax[0, 0].set_title(f'Geral: r = {r:+.2f} ({forca(r)})')
    linhas = [('Geral', len(d0), r)]
    if por:
        grupos = [g for g in (ORDEM_CRIT if por == 'Criticidade' else sorted(d0[por].dropna().unique()))]
        for g in grupos:
            sub = d0[d0[por] == g]
            rg = sub[x].corr(sub[y]); linhas.append((f'{por} = {g}', len(sub), rg))
            cor = CORES_CRIT.get(g) or CORES_CANAL.get(g)
            sns.regplot(data=sub, x=x, y=y, ax=ax[0, 1], color=cor, x_jitter=.15, y_jitter=.15, scatter_kws={'alpha': .3}, label=f'{g}: r = {rg:+.2f}')
        ax[0, 1].legend(); ax[0, 1].set_title(f'Dentro de cada {por}')
    plt.tight_layout(); plt.show()
    display(pd.DataFrame(linhas, columns=['Recorte', 'n', 'r']).set_index('Recorte'))

# Base metrica_cx_corr_v2.csv embutida (não precisa subir nenhum arquivo)
CSV = '''Id,Age,Canal,Criticidade,Tempo_Resolucao_h,Status_Chamado,e_NPS,CES,RATINGS
1,45,Portal,Alta,42.5,Resolvido,10,3,5
2,49,Telefone,Baixa,3.4,Resolvido,4,4,1
3,34,Portal,Baixa,3.3,Resolvido,9,2,4
4,58,Telefone,Alta,28.3,Resolvido,9,4,5
5,38,Chat,Baixa,1.2,Resolvido,7,2,3
6,25,Portal,Media,11.2,Resolvido,8,4,3
7,45,Portal,Baixa,6.3,Resolvido,4,4,1
8,49,Portal,Alta,71.6,Resolvido,9,3,4
9,24,Chat,Alta,68.6,Resolvido,10,1,5
10,57,Telefone,Baixa,4.5,Resolvido,2,4,1
11,26,Chat,Media,16.5,Resolvido,7,3,4
12,32,Portal,Baixa,3.2,Resolvido,5,3,2
13,60,Telefone,Media,20.4,Resolvido,6,4,2
14,37,Portal,Media,20.2,Resolvido,6,4,1
15,50,Telefone,Alta,64.5,Resolvido,7,4,3
16,29,Chat,Baixa,7.3,Resolvido,1,3,1
17,0,Telefone,Baixa,4.0,Resolvido,3,5,1
18,31,Chat,Media,20.3,Resolvido,8,3,3
19,43,Portal,Media,20.9,Resolvido,7,3,3
20,39,Telefone,Baixa,3.2,Resolvido,3,5,1
21,37,Portal,Baixa,7.5,Resolvido,2,3,1
22,33,Chat,Baixa,1.7,Resolvido,8,2,3
23,30,Portal,Alta,71.7,Resolvido,8,4,3
24,42,Portal,Baixa,6.4,Resolvido,6,3,2
25,42,Portal,Baixa,1.7,Resolvido,7,3,3
26,37,Chat,Alta,55.5,Resolvido,10,2,5
27,43,Telefone,Baixa,1.2,Resolvido,2,3,2
28,28,Chat,Media,20.3,Resolvido,6,2,3
29,36,Chat,Baixa,6.6,Resolvido,4,3,2
30,36,Telefone,Alta,52.9,Resolvido,7,4,3
31,58,Telefone,Media,21.7,Resolvido,6,3,2
32,37,Portal,Alta,28.7,Resolvido,10,3,5
33,33,Chat,Baixa,2.9,Resolvido,3,4,2
34,34,Chat,Media,14.6,Resolvido,10,2,4
35,46,Telefone,Media,8.7,Resolvido,9,3,4
36,35,Chat,Baixa,4.1,Resolvido,4,4,1
37,25,Chat,Baixa,2.9,Resolvido,5,3,3
38,54,Telefone,Baixa,3.7,Resolvido,6,4,2
39,31,Chat,Alta,44.4,Resolvido,10,2,5
40,62,Telefone,Media,22.1,Resolvido,4,5,1
41,48,Telefone,Media,12.3,Resolvido,9,4,4
42,39,Portal,Media,22.3,Resolvido,3,4,1
43,60,Telefone,Media,14.8,Resolvido,6,4,3
44,29,Chat,Baixa,3.3,Resolvido,6,2,3
45,53,Portal,Baixa,4.5,Resolvido,2,3,1
46,44,Portal,Media,14.7,Resolvido,6,3,3
47,33,Chat,Baixa,2.8,Resolvido,5,3,2
48,25,Chat,Alta,48.1,Resolvido,10,2,5
49,67,Telefone,Media,10.4,Resolvido,9,3,4
50,31,Chat,Baixa,3.5,Resolvido,5,3,2
51,20,Chat,Media,17.1,Resolvido,9,3,4
52,19,Chat,Baixa,3.9,Resolvido,5,3,2
53,24,Portal,Alta,63.5,Resolvido,9,3,4
54,44,Telefone,Alta,36.3,Resolvido,10,4,5
55,54,Telefone,Alta,70.5,Resolvido,5,4,2
56,29,Portal,Baixa,6.5,Resolvido,4,3,1
57,54,Telefone,Baixa,7.8,Resolvido,0,4,1
58,44,Telefone,Baixa,6.9,Resolvido,3,4,1
59,24,Chat,Baixa,2.0,Resolvido,4,4,2
60,24,Chat,Baixa,4.7,Resolvido,8,1,4
61,42,Telefone,Baixa,2.2,Resolvido,5,4,2
62,47,Telefone,Alta,63.3,Resolvido,9,3,4
63,49,Telefone,Baixa,5.1,Resolvido,1,4,1
64,47,Portal,Baixa,2.8,Resolvido,7,2,3
65,60,Telefone,Alta,68.6,Resolvido,8,2,4
66,43,Telefone,Media,9.8,Resolvido,9,4,3
67,54,Telefone,Media,17.0,Resolvido,7,4,3
68,28,Chat,Media,19.5,Resolvido,8,1,4
69,29,Chat,Alta,26.8,Resolvido,10,3,5
70,52,Telefone,Media,17.6,Resolvido,2,5,1
71,29,Chat,Media,21.1,Resolvido,8,3,4
72,48,Telefone,Media,9.1,Resolvido,9,4,3
73,35,Portal,Baixa,4.6,Resolvido,7,3,3
74,26,Chat,Baixa,2.8,Resolvido,5,3,3
75,34,Chat,Baixa,5.6,Resolvido,6,3,2
76,22,Chat,Baixa,1.8,Resolvido,4,3,2
77,33,Chat,Media,23.0,Resolvido,5,2,3
78,62,Telefone,Baixa,7.3,Resolvido,3,4,1
79,52,Telefone,Baixa,2.3,Resolvido,9,4,3
80,24,Portal,Baixa,3.3,Resolvido,8,2,3
81,51,Telefone,Alta,52.2,Resolvido,10,4,4
82,50,Telefone,Baixa,6.0,Resolvido,0,5,1
83,39,Portal,Media,15.1,Resolvido,7,3,4
84,23,Chat,Alta,31.5,Resolvido,10,3,5
85,31,Chat,Baixa,1.7,Resolvido,10,2,5
86,25,Chat,Media,24.0,Resolvido,5,2,3
87,60,Telefone,Baixa,4.2,Resolvido,3,4,1
88,54,Telefone,Baixa,7.1,Resolvido,2,3,1
89,34,Chat,Media,15.7,Resolvido,10,2,5
90,55,Telefone,Alta,68.3,Resolvido,6,5,2
91,37,Chat,Baixa,1.6,Resolvido,8,3,3
92,58,Telefone,Media,9.8,Resolvido,10,3,5
93,36,Telefone,Baixa,7.5,Resolvido,1,5,1
94,34,Chat,Media,23.2,Resolvido,10,2,4
95,39,Chat,Media,13.0,Resolvido,6,3,3
96,39,Telefone,Media,13.7,Resolvido,10,4,3
97,29,Chat,Media,15.2,Resolvido,8,3,3
98,26,Chat,Baixa,3.9,Resolvido,6,2,2
99,32,Chat,Media,11.0,Resolvido,10,3,4
100,33,Portal,Media,22.4,Resolvido,8,3,2
101,29,Portal,Media,12.1,Resolvido,10,3,4
102,47,Telefone,Baixa,5.9,Resolvido,5,3,3
103,30,Chat,Baixa,1.5,Resolvido,7,4,2
104,31,Portal,Baixa,1.3,Resolvido,7,3,3
105,44,Portal,Baixa,5.6,Resolvido,5,3,2
106,55,Telefone,Baixa,3.4,Resolvido,5,3,3
107,39,Telefone,Baixa,5.6,Resolvido,4,3,1
108,34,Chat,Media,9.5,Resolvido,8,3,4
109,38,Chat,Baixa,7.6,Resolvido,4,3,1
110,40,Portal,Alta,59.9,Resolvido,10,1,5
111,57,Telefone,Media,22.0,Resolvido,3,5,1
112,35,Chat,Media,10.2,Resolvido,10,2,4
113,24,Chat,Baixa,3.2,Resolvido,8,3,3
114,45,Telefone,Baixa,3.6,Resolvido,5,4,2
115,37,Chat,Media,16.6,Resolvido,8,2,4
116,35,Portal,Alta,38.2,Resolvido,10,4,4
117,34,Portal,Baixa,1.4,Resolvido,9,2,4
118,44,Telefone,Media,13.9,Resolvido,9,3,4
119,62,Telefone,Media,12.1,Resolvido,7,4,2
120,49,Telefone,Media,14.2,Resolvido,5,4,2
121,62,Telefone,Baixa,2.4,Resolvido,7,3,3
122,47,Telefone,Media,12.2,Resolvido,7,3,4
123,33,Chat,Baixa,5.4,Resolvido,6,3,2
124,52,Telefone,Alta,42.6,Resolvido,10,3,4
125,33,Chat,Baixa,3.4,Resolvido,9,2,3
126,64,Telefone,Baixa,4.7,Resolvido,8,3,2
127,21,Chat,Alta,61.0,Resolvido,10,2,5
128,34,Chat,Baixa,3.7,Resolvido,8,2,3
129,34,Chat,Baixa,5.1,Resolvido,4,3,2
130,55,Telefone,Baixa,7.8,Resolvido,2,3,1
131,27,Chat,Baixa,4.7,Resolvido,6,3,2
132,40,Portal,Baixa,7.4,Resolvido,6,2,2
133,47,Telefone,Baixa,6.6,Resolvido,2,3,1
134,44,Chat,Media,8.9,Resolvido,8,3,4
135,32,Telefone,Media,14.9,Resolvido,5,4,2
136,33,Chat,Baixa,5.9,Resolvido,6,2,2
137,47,Portal,Media,23.8,Resolvido,7,3,2
138,44,Telefone,Baixa,4.2,Resolvido,4,5,1
139,34,Portal,Alta,28.5,Resolvido,9,4,5
140,30,Chat,Baixa,4.9,Resolvido,9,2,3
141,49,Telefone,Media,10.0,Resolvido,10,4,4
142,50,Telefone,Baixa,6.3,Resolvido,2,4,1
143,47,Portal,Media,16.1,Resolvido,8,2,4
144,43,Telefone,Baixa,6.1,Resolvido,3,4,1
145,57,Telefone,Media,21.9,Resolvido,5,4,2
146,31,Chat,Baixa,5.4,Resolvido,3,3,1
147,29,Chat,Alta,53.4,Resolvido,9,3,4
148,55,Telefone,Media,20.1,Resolvido,2,4,2
149,53,Telefone,Media,21.5,Resolvido,4,4,2
150,35,Chat,Alta,65.7,Resolvido,9,3,3
151,22,Portal,Alta,25.7,Resolvido,10,2,5
152,52,Portal,Baixa,4.9,Resolvido,5,3,2
153,38,Chat,Baixa,2.5,Resolvido,9,2,4
154,43,Telefone,Baixa,7.0,Resolvido,7,3,2
155,22,Chat,Baixa,5.5,Resolvido,8,2,2
156,44,Telefone,Media,14.7,Resolvido,6,5,2
157,34,Chat,Alta,33.0,Resolvido,10,2,5
158,54,Telefone,Alta,40.3,Resolvido,9,5,4
159,51,Telefone,Media,19.3,Resolvido,6,4,2
160,33,Portal,Media,11.3,Resolvido,10,3,5
161,33,Chat,Alta,28.5,Resolvido,10,4,4
162,43,Portal,Alta,66.6,Resolvido,9,2,5
163,23,Chat,Baixa,6.3,Resolvido,6,1,3
164,33,Chat,Media,11.2,Resolvido,7,3,3
165,55,Telefone,Alta,38.0,Resolvido,10,3,5
166,28,Chat,Baixa,7.8,Resolvido,7,2,2
167,34,Portal,Baixa,6.0,Resolvido,5,2,2
168,55,Portal,Alta,53.3,Resolvido,10,3,4
169,42,Chat,Alta,38.8,Resolvido,10,2,5
170,47,Portal,Alta,38.4,Resolvido,10,3,5
171,30,Chat,Media,8.6,Resolvido,10,3,5
172,39,Telefone,Baixa,6.1,Resolvido,3,3,1
173,36,Chat,Baixa,1.3,Resolvido,9,2,3
174,45,Portal,Media,8.1,Resolvido,10,3,5
175,32,Chat,Media,19.7,Resolvido,8,1,4
176,36,Chat,Media,23.2,Resolvido,7,2,3
177,32,Telefone,Media,20.1,Resolvido,8,4,2
178,35,Portal,Baixa,4.3,Resolvido,4,3,2
179,40,Portal,Media,15.8,Resolvido,7,3,3
180,42,Telefone,Baixa,4.1,Resolvido,5,4,1
181,38,Portal,Baixa,3.3,Resolvido,7,2,4
182,30,Portal,Baixa,4.7,Resolvido,7,3,2
183,42,Telefone,Baixa,4.0,Resolvido,0,5,1
184,29,Chat,Alta,52.7,Resolvido,10,2,5
185,42,Portal,Baixa,7.3,Resolvido,4,3,1
186,64,Telefone,Baixa,8.0,Resolvido,3,4,1
187,24,Chat,Media,9.3,Resolvido,8,3,4
188,40,Chat,Media,14.2,Resolvido,10,3,4
189,66,Telefone,Baixa,2.3,Resolvido,5,4,2
190,21,Chat,Baixa,3.5,Resolvido,10,1,5
191,39,Portal,Baixa,3.0,Resolvido,8,3,3
192,25,Chat,Media,10.8,Resolvido,8,3,4
193,31,Chat,Baixa,6.3,Resolvido,5,2,2
194,19,Portal,Baixa,4.5,Resolvido,6,3,2
195,29,Chat,Baixa,7.4,Resolvido,4,2,2
196,35,Chat,Media,8.5,Resolvido,10,1,5
197,55,Telefone,Baixa,1.5,Resolvido,8,4,2
198,40,Portal,Alta,43.4,Resolvido,10,2,5
199,33,Chat,Baixa,1.6,Resolvido,7,2,4
200,35,Chat,Media,12.2,Resolvido,6,3,3
201,36,Portal,Baixa,7.9,Resolvido,5,1,2
202,39,Portal,Baixa,2.5,Resolvido,10,2,4
203,57,Telefone,Baixa,2.4,Resolvido,8,3,3
204,31,Chat,Media,17.2,Resolvido,10,2,5
205,31,Chat,Alta,47.9,Resolvido,10,2,5
206,37,Chat,Baixa,5.1,Resolvido,6,3,2
207,38,Chat,Baixa,3.6,Resolvido,5,3,3
208,53,Telefone,Alta,63.7,Resolvido,8,4,3
209,28,Chat,Media,10.2,Resolvido,10,2,5
210,55,Telefone,Baixa,4.0,Resolvido,4,4,1
211,45,Telefone,Baixa,5.8,Resolvido,2,3,1
212,41,Telefone,Media,21.9,Resolvido,4,5,1
213,37,Chat,Media,13.9,Resolvido,10,2,4
214,38,Portal,Media,17.1,Resolvido,8,3,3
215,46,Telefone,Alta,27.3,Resolvido,10,5,4
216,63,Telefone,Baixa,2.2,Resolvido,5,4,2
217,25,Chat,Baixa,1.5,Resolvido,9,2,4
218,37,Chat,Baixa,6.1,Resolvido,6,3,1
219,30,Portal,Baixa,3.0,Resolvido,10,1,4
220,32,Chat,Baixa,6.1,Resolvido,3,3,1
221,26,Chat,Baixa,1.5,Resolvido,10,2,4
222,47,Telefone,Baixa,7.0,Resolvido,2,4,1
223,48,Telefone,Media,21.4,Resolvido,3,4,1
224,26,Portal,Baixa,1.6,Resolvido,8,3,3
225,25,Chat,Baixa,1.2,Resolvido,7,2,4
226,23,Portal,Media,8.9,Resolvido,10,3,4
227,24,Chat,Media,21.7,Resolvido,6,2,3
228,67,Telefone,Media,11.8,Resolvido,8,4,4
229,48,Telefone,Media,16.8,Resolvido,7,4,3
230,46,Chat,Media,14.8,Resolvido,9,3,4
231,23,Chat,Baixa,6.6,Resolvido,6,2,3
232,49,Telefone,Baixa,4.4,Resolvido,4,4,1
233,54,Portal,Media,16.0,Resolvido,9,4,4
234,42,Telefone,Baixa,7.9,Resolvido,1,3,1
235,34,Portal,Baixa,2.1,Resolvido,7,3,3
236,51,Portal,Baixa,6.8,Resolvido,6,2,2
237,39,Telefone,Baixa,1.4,Resolvido,8,4,3
238,42,Portal,Baixa,4.3,Resolvido,8,2,3
239,28,Chat,Baixa,7.2,Resolvido,3,2,2
240,38,Chat,Alta,55.9,Resolvido,10,4,4
241,43,Portal,Alta,56.9,Resolvido,10,2,5
242,31,Portal,Baixa,2.8,Resolvido,9,2,3
243,25,Chat,Alta,44.1,Resolvido,10,1,5
244,37,Telefone,Baixa,3.6,Resolvido,4,5,1
245,52,Telefone,Alta,49.0,Resolvido,9,4,4
246,38,Portal,Alta,46.2,Resolvido,9,3,4
247,66,Telefone,Baixa,3.3,Resolvido,2,4,1
248,50,Telefone,Media,12.9,Resolvido,10,3,5
249,30,Chat,Alta,36.0,Resolvido,10,2,5
250,42,Telefone,Alta,41.5,Resolvido,7,5,3
251,56,Telefone,Alta,31.2,Resolvido,7,5,4
252,28,Portal,Media,22.0,Resolvido,8,2,3
253,44,Telefone,Baixa,5.2,Resolvido,6,4,1
254,48,Chat,Alta,30.4,Resolvido,10,2,5
255,27,Chat,Media,19.1,Resolvido,10,1,5
256,48,Telefone,Media,21.6,Resolvido,3,5,1
257,32,Portal,Baixa,2.7,Resolvido,8,4,2
258,30,Chat,Media,10.4,Resolvido,7,3,4
259,34,Chat,Baixa,1.1,Resolvido,9,2,4
260,48,Telefone,Media,8.8,Resolvido,7,4,3
261,32,Chat,Baixa,6.3,Resolvido,5,2,2
262,41,Portal,Media,23.8,Resolvido,7,3,3
263,23,Chat,Alta,26.2,Resolvido,10,2,5
264,22,Chat,Baixa,6.2,Resolvido,10,1,4
265,53,Portal,Media,9.1,Resolvido,10,2,5
266,29,Chat,Baixa,5.1,Resolvido,6,3,3
267,27,Chat,Alta,60.3,Resolvido,10,1,5
268,31,Chat,Media,13.7,Resolvido,10,2,5
269,36,Chat,Baixa,1.1,Resolvido,10,2,5
270,32,Chat,Baixa,5.2,Resolvido,6,2,3
271,27,Chat,Baixa,7.9,Resolvido,7,2,2
272,38,Chat,Baixa,2.8,Resolvido,10,1,4
273,40,Chat,Alta,33.1,Resolvido,10,1,5
274,54,Telefone,Media,10.0,Resolvido,8,3,4
275,54,Telefone,Baixa,4.9,Resolvido,7,4,2
276,38,Chat,Alta,52.6,Resolvido,10,1,5
277,38,Chat,Baixa,6.5,Resolvido,7,1,3
278,56,Telefone,Alta,60.1,Resolvido,9,2,5
279,35,Portal,Baixa,7.2,Resolvido,4,4,1
280,35,Portal,Media,20.9,Resolvido,8,3,3
281,24,Chat,Alta,35.9,Resolvido,10,2,5
282,35,Chat,Baixa,4.9,Resolvido,7,2,2
283,23,Chat,Media,12.8,Resolvido,10,2,5
284,26,Chat,Alta,39.8,Resolvido,10,2,5
285,47,Telefone,Baixa,7.5,Resolvido,2,3,1
286,0,Telefone,Baixa,5.8,Resolvido,3,3,2
287,40,Chat,Media,23.6,Resolvido,7,4,2
288,29,Chat,Baixa,3.9,Resolvido,8,2,3
289,59,Telefone,Baixa,4.8,Resolvido,5,3,2
290,30,Chat,Baixa,4.4,Resolvido,9,2,4
291,53,Portal,Media,9.7,Resolvido,10,2,5
292,31,Chat,Baixa,2.7,Resolvido,7,3,3
293,43,Portal,Baixa,4.7,Resolvido,8,2,4
294,29,Chat,Alta,27.2,Resolvido,10,2,5
295,30,Portal,Media,22.9,Resolvido,9,3,3
296,49,Portal,Alta,29.9,Resolvido,10,3,5
297,0,Portal,Baixa,2.4,Resolvido,10,2,4
298,44,Portal,Alta,60.7,Resolvido,10,2,5
299,39,Portal,Media,9.6,Resolvido,10,2,5
300,51,Telefone,Baixa,7.3,Resolvido,6,3,2
301,48,Portal,Alta,58.8,Resolvido,10,2,5
302,29,Chat,Baixa,1.5,Resolvido,9,3,4
303,44,Telefone,Baixa,5.8,Resolvido,7,3,2
304,55,Telefone,Baixa,5.4,Resolvido,5,3,2
305,41,Portal,Media,20.1,Resolvido,8,2,3
306,56,Telefone,Baixa,6.8,Resolvido,4,4,1
307,26,Chat,Baixa,6.0,Resolvido,6,2,3
308,57,Telefone,Baixa,5.1,Resolvido,3,4,1
309,27,Chat,Baixa,3.3,Resolvido,10,2,4
310,39,Chat,Baixa,5.9,Resolvido,9,2,4
311,49,Telefone,Media,23.3,Resolvido,6,3,3
312,41,Telefone,Baixa,5.1,Resolvido,5,3,3
313,31,Chat,Baixa,5.7,Resolvido,9,2,3
314,31,Chat,Media,15.0,Resolvido,9,2,4
315,30,Chat,Baixa,6.3,Resolvido,6,1,3
316,31,Chat,Media,24.0,Resolvido,9,1,4
317,41,Chat,Baixa,2.1,Resolvido,7,2,4
318,60,Telefone,Baixa,2.4,Resolvido,5,5,1
319,19,Chat,Baixa,4.8,Resolvido,8,1,4
320,0,Portal,Baixa,4.4,Resolvido,10,2,4
321,29,Portal,Baixa,5.0,Resolvido,8,1,3
322,63,Telefone,Media,8.8,Resolvido,10,3,5
323,34,Chat,Baixa,3.8,Resolvido,10,2,4
324,57,Telefone,Media,17.3,Resolvido,8,3,3
325,43,Portal,Media,17.4,Resolvido,10,2,5
326,42,Telefone,Baixa,5.6,Resolvido,6,3,2
327,37,Portal,Media,19.5,Resolvido,10,2,4
328,51,Telefone,Baixa,5.5,Resolvido,8,2,3
329,55,Telefone,Baixa,6.5,Resolvido,6,4,1
330,28,Chat,Baixa,5.4,Resolvido,7,2,3
331,53,Telefone,Media,16.6,Resolvido,6,4,2
332,32,Chat,Alta,53.1,Resolvido,10,1,5
333,57,Telefone,Baixa,1.7,Resolvido,6,4,2
334,45,Portal,Media,12.4,Resolvido,10,3,4
335,19,Chat,Media,16.4,Resolvido,10,1,5
336,33,Telefone,Baixa,7.1,Resolvido,5,3,2
337,24,Chat,Media,18.9,Resolvido,8,2,4
338,61,Telefone,Media,9.4,Resolvido,7,5,3
339,29,Chat,Alta,52.4,Resolvido,9,3,4
340,31,Portal,Alta,34.6,Resolvido,10,1,5
341,25,Chat,Baixa,6.1,Resolvido,4,4,1
342,24,Portal,Baixa,6.8,Resolvido,8,2,3
343,19,Portal,Media,17.5,Resolvido,9,3,4
344,55,Telefone,Baixa,5.1,Resolvido,4,4,1
345,29,Portal,Baixa,3.4,Resolvido,7,2,4
346,33,Portal,Alta,45.4,Resolvido,10,3,5
347,26,Portal,Baixa,7.0,Resolvido,8,2,3
348,20,Chat,Baixa,6.1,Resolvido,5,2,2
349,43,Telefone,Alta,48.9,Resolvido,10,4,5
350,25,Chat,Baixa,3.6,Resolvido,5,3,2
351,65,Telefone,Baixa,1.4,Resolvido,8,3,3
352,21,Chat,Alta,30.9,Resolvido,10,2,5
353,44,Telefone,Baixa,2.4,Resolvido,6,4,2
354,58,Telefone,Baixa,3.6,Resolvido,6,4,2
355,56,Telefone,Baixa,7.6,Resolvido,3,4,1
356,55,Telefone,Alta,48.2,Resolvido,10,3,5
357,37,Portal,Baixa,2.6,Resolvido,10,2,4
358,46,Portal,Media,9.7,Resolvido,8,2,4
359,57,Telefone,Baixa,3.4,Resolvido,7,3,3
360,56,Telefone,Baixa,6.7,Resolvido,6,4,1
361,35,Portal,Alta,42.4,Resolvido,10,3,5
362,23,Chat,Media,20.4,Resolvido,10,2,4
363,29,Chat,Alta,62.5,Resolvido,10,3,4
364,33,Chat,Baixa,1.8,Resolvido,6,3,3
365,41,Telefone,Media,17.7,Resolvido,5,4,3
366,64,Telefone,Alta,70.0,Resolvido,9,3,3
367,39,Portal,Baixa,3.8,Resolvido,5,3,2
368,62,Telefone,Baixa,1.4,Resolvido,9,3,4
369,29,Chat,Alta,68.3,Resolvido,9,2,4
370,38,Portal,Baixa,7.2,Resolvido,4,2,2
371,32,Portal,Media,16.4,Resolvido,8,2,4
372,43,Chat,Alta,50.5,Resolvido,10,1,5
373,24,Chat,Baixa,2.5,Resolvido,9,2,4
374,25,Chat,Baixa,6.7,Resolvido,6,1,3
375,40,Chat,Baixa,4.5,Resolvido,5,4,2
376,25,Chat,Baixa,1.2,Resolvido,10,1,5
377,42,Portal,Baixa,5.8,Resolvido,9,1,4
378,50,Telefone,Media,23.2,Resolvido,4,4,1
379,34,Chat,Baixa,6.8,Resolvido,6,3,2
380,58,Telefone,Media,12.4,Resolvido,9,3,4
381,51,Telefone,Baixa,1.4,Resolvido,6,4,2
382,46,Portal,Baixa,7.6,Resolvido,7,1,3
383,19,Portal,Baixa,7.6,Resolvido,6,2,2
384,49,Telefone,Media,16.5,Resolvido,8,3,3
385,45,Chat,Baixa,5.5,Resolvido,9,1,4
386,46,Portal,Baixa,4.2,Resolvido,7,2,3
387,45,Telefone,Alta,44.1,Resolvido,10,2,5
388,30,Portal,Media,9.9,Resolvido,10,1,5
389,30,Chat,Baixa,1.7,Resolvido,10,1,5
390,37,Portal,Alta,35.2,Resolvido,10,2,5
391,37,Telefone,Baixa,6.9,Resolvido,3,4,1
392,23,Chat,Baixa,2.0,Resolvido,10,2,4
393,59,Telefone,Baixa,2.6,Resolvido,9,4,3
394,59,Telefone,Baixa,4.8,Resolvido,6,4,2
395,24,Chat,Baixa,2.5,Resolvido,10,3,4
396,51,Telefone,Media,10.6,Resolvido,10,3,5
397,25,Portal,Baixa,4.9,Resolvido,8,3,3
398,39,Chat,Media,13.9,Resolvido,10,2,5
399,54,Telefone,Alta,54.1,Resolvido,10,3,5
400,54,Telefone,Media,22.6,Resolvido,6,3,2
401,26,Chat,Media,10.4,Resolvido,10,2,5
402,37,Portal,Media,22.6,Resolvido,7,2,3
403,36,Portal,Alta,67.3,Resolvido,10,3,4
404,28,Chat,Baixa,6.8,Resolvido,9,2,2
405,36,Portal,Baixa,5.4,Resolvido,7,2,3
406,31,Portal,Media,17.9,Resolvido,10,2,5
407,28,Chat,Media,18.2,Resolvido,10,1,5
408,47,Portal,Baixa,5.8,Resolvido,5,3,2
409,24,Chat,Media,8.3,Resolvido,10,2,5
410,34,Portal,Baixa,7.7,Resolvido,6,2,3
411,46,Telefone,Alta,52.1,Resolvido,10,4,4
412,53,Telefone,Baixa,6.5,Resolvido,2,3,1
413,0,Chat,Baixa,3.6,Resolvido,9,1,4
414,23,Portal,Baixa,1.1,Resolvido,7,3,4
415,35,Chat,Baixa,4.6,Resolvido,10,1,4
416,40,Chat,Baixa,4.6,Resolvido,10,2,4
417,39,Chat,Baixa,4.1,Resolvido,8,2,4
418,28,Portal,Baixa,3.4,Resolvido,6,3,3
419,41,Chat,Baixa,2.7,Resolvido,10,2,4
420,51,Portal,Baixa,4.7,Resolvido,8,1,4'''
d = pd.read_csv(io.StringIO(CSV))
os.makedirs('entrega', exist_ok=True)
print('✅ Base carregada:', d.shape[0], 'linhas ×', d.shape[1], 'colunas')
```

## 00 · Identificação do grupo
📋 *RM, nome e ferramentas de IA usadas.* (No portal, os RMs vão **separados por vírgula** no campo do upload.)

| RM | Nome |
|---|---|
| | |
| | |
| | |
| | |

**Ferramenta(s) de IA usada(s):**

## 01 · Hipóteses ANTES dos dados (10 min · 🚫 SEM IA)
📋 *"Sem abrir a base, apenas pelo dicionário de dados: o que a experiência de vocês como gestores diz que vai aparecer? Registrem agora; vocês vão confrontar isso com os dados na Etapa 4."*

> ⚠️ **Regra da professora:** nada de IA nesta etapa, e **não rode as células de análise antes de responder**. Não há insight nem referência aqui de propósito: o valor está em registrar o seu *feeling* para depois ver quais "dogmas caem".

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
| CES | Esforço para resolver o problema (1 = muito fácil, 5 = muito difícil) |
| RATINGS | Satisfação com o atendimento (1 = muito insatisfeito, 5 = muito satisfeito) |

**Perguntas que ajudam a pensar:** Demorar mais deixa o colaborador mais ou menos satisfeito? Qual canal deve ser o melhor ou o pior? A idade influencia o quê? Chamados críticos são mais bem ou mais mal avaliados? NPS, CES e RATINGS andam juntos?

### ✍️ Sua resposta, Etapa 1
| # | O que esperamos encontrar | Por que acreditamos nisso |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |

## 02 · Matriz de correlação e leituras (15 min · IA liberada)
### 2.1 📋 *"Antes da matriz, olhem os dados. Mínimo, máximo, valores estranhos, colunas que não variam. O que chamou atenção?"*
▶️ Rode a estatística descritiva, o primeiro passo que a professora recomendou (*"aplique estatística descritiva"*).

```python
d.describe(include='all').T
```

```python
print('Valores faltantes no total:', d.isna().sum().sum())
print('Colunas que NÃO variam:', [c for c in d.columns if d[c].nunique() == 1])
print('Idades iguais a 0 (Ids):', d.loc[d.Age == 0, 'Id'].tolist())
print('Criticidade:', d.Criticidade.value_counts().to_dict())
print('Canal:', d.Canal.value_counts().to_dict())

fig, ax = plt.subplots(1, 4, figsize=(18, 3.6))
sns.histplot(d.Age, bins=25, ax=ax[0]).set_title('Idade: repare nos zeros')
sns.histplot(d.Tempo_Resolucao_h, bins=30, ax=ax[1]).set_title('Tempo de resolução (h)')
ax[1].axvline(d.Tempo_Resolucao_h.mean(), color='red', ls='--', label='média'); ax[1].axvline(d.Tempo_Resolucao_h.median(), color='green', ls='--', label='mediana'); ax[1].legend()
sns.countplot(data=d, x='e_NPS', ax=ax[2], color='#3A7CA5').set_title('e_NPS (0 a 10)')
sns.boxplot(data=d, x='Criticidade', y='Tempo_Resolucao_h', order=ORDEM_CRIT, palette=CORES_CRIT, ax=ax[3]).set_title('Tempo por criticidade')
plt.tight_layout(); plt.show()
```

### 💡 Insight: como ler a estatística descritiva
- **Média × mediana:** quando a **média é bem maior que a mediana**, há uma **cauda longa**: poucos casos muito altos puxam a média para cima. Aqui o tempo médio é ~15,9 h e a mediana ~7,7 h, então **alguns chamados demoram muito mais que o normal**. Para gestão, a mediana representa melhor o "chamado típico".
- **Mínimo e máximo** revelam **erros de cadastro** e **outliers**. Uma idade = 0 é impossível para um colaborador.
- **Coluna que não varia** (`nunique = 1`) não pode ter correlação com nada, então sai da matriz. Mas ela diz algo sobre **quem foi ouvido**: se todo chamado está "Resolvido", **a pesquisa só ouviu quem teve o problema resolvido** (viés de seleção / sobrevivência, Parte 1 da aula).
- **Distribuição das categorias:** saber que 52% dos chamados são de baixa criticidade ajuda a priorizar onde está o maior volume.

### ✍️ Sua resposta: o que chamou atenção?
_Clique duas vezes aqui e escreva com as suas palavras._

- 
- 
- 

<details><summary>🔎 <b>Referência</b> (clique para abrir, só depois de responder)</summary>

- 420 respostas, sem valores faltantes.
- `Status_Chamado` = "Resolvido" em 100%: não varia (e só ouve quem foi atendido até o fim).
- 5 idades = 0 (Ids 17, 286, 297, 320, 413): erro de cadastro, tratar como ausente.
- Tempo de 1,1 h a 71,7 h; média 15,9 h ≫ mediana 7,7 h, uma cauda longa.
- Baixa 52%, Média 30%, Alta 19% · Chat 40%, Telefone 34%, Portal 26%.
</details>

### 2.2 Preparar os dados para a matriz
A correlação de Pearson só funciona com **números**. Decisões de preparação:
- `Id` sai (identificador) · `Status_Chamado` sai (constante) · `Age = 0` vira ausente.
- `Criticidade` → **escala ordinal** 1 = Baixa, 2 = Média, 3 = Alta (existe uma ordem).
- `Canal` → **one-hot**: três colunas 0/1 (não existe ordem entre Chat, Portal e Telefone).

```python
d.loc[d.Age == 0, 'Age'] = np.nan
d['Criticidade_num'] = d.Criticidade.map({'Baixa': 1, 'Media': 2, 'Alta': 3})
num = pd.DataFrame({
    'Idade': d.Age, 'Criticidade': d.Criticidade_num, 'Tempo_Resolucao_h': d.Tempo_Resolucao_h,
    'e_NPS': d.e_NPS, 'CES': d.CES, 'RATINGS': d.RATINGS,
    'Canal_Chat': (d.Canal == 'Chat').astype(int), 'Canal_Portal': (d.Canal == 'Portal').astype(int),
    'Canal_Telefone': (d.Canal == 'Telefone').astype(int)})
num.head()
```

### 💡 Insight: por que codificar assim?
- Se transformássemos Canal em 1, 2, 3, estaríamos dizendo que "Telefone = 3 × Chat", o que não faz sentido. O **one-hot** evita essa ordem falsa.
- **Efeito colateral:** as colunas de canal têm correlação negativa entre si **por construção** (se é Chat, não é Telefone). Esses pares **não são insight de negócio** e serão ignorados.

### 2.3 📋 *"Captura da matriz de correlação (colem a imagem aqui)"*
▶️ A imagem é salva em `entrega/01_heatmap.png` para você colar no Word.

```python
corr = num.corr(method='pearson')
plt.figure(figsize=(10, 8))
sns.heatmap(corr, mask=np.triu(np.ones_like(corr, bool), 1), annot=True, fmt='.2f', cmap='RdBu_r', vmin=-1, vmax=1,
            square=True, cbar_kws={'label': 'r de Pearson'})
plt.title('Matriz de correlação: Suporte de TI (n = 420)')
plt.tight_layout(); plt.savefig('entrega/01_heatmap.png', dpi=150); plt.show()
```

### 💡 Insight: como ler o mapa de calor
- 🔴 **Vermelho forte** = perto de **+1**: as duas sobem juntas. 🔵 **Azul forte** = perto de **−1**: uma sobe e a outra desce. ⚪ **Branco** = perto de **0**: sem relação linear.
- A diagonal é sempre 1 (a variável com ela mesma), por isso mostramos só metade da matriz.
- **Atenção ao sinal com o CES:** o CES é "esforço", então **maior = pior**. Uma correlação **negativa** entre CES e RATINGS significa "mais esforço → menos satisfação", o que faz todo o sentido.

### 2.4 📋 *"Listem as correlações maiores que 0,4 ou menores que −0,4. Na coluna 'Leitura', escrevam apenas o que o número diz, sem explicar o porquê."*

```python
canais = {'Canal_Chat', 'Canal_Portal', 'Canal_Telefone'}
pares = []
cols = list(corr.columns)
for i, a in enumerate(cols):
    for b in cols[i + 1:]:
        r = corr.loc[a, b]
        if abs(r) > LIMIAR and not ({a, b} <= canais):
            pares.append((a, b, round(r, 2), 'positiva' if r > 0 else 'negativa', forca(r)))
rel = pd.DataFrame(pares, columns=['Variável 1', 'Variável 2', 'r', 'Sentido', 'Força']).sort_values('r', key=abs, ascending=False).reset_index(drop=True)
rel
```

```python
# Um gráfico de dispersão para cada par (o que a professora recomenda levar ao diretor, em vez da matriz)
n = len(rel); cols_g = 3; linhas_g = int(np.ceil(n / cols_g))
fig, axs = plt.subplots(linhas_g, cols_g, figsize=(16, 4 * linhas_g))
for ax, (_, p) in zip(axs.flat, rel.iterrows()):
    sns.regplot(data=num, x=p['Variável 1'], y=p['Variável 2'], ax=ax, x_jitter=.15, y_jitter=.15, scatter_kws={'alpha': .25, 's': 12})
    ax.set_title(f"{p['Variável 1']} × {p['Variável 2']}  (r = {p.r:+.2f})", fontsize=10)
for ax in list(axs.flat)[n:]: ax.axis('off')
plt.tight_layout(); plt.show()
```

### 💡 Insight: como escrever a "Leitura" (e como ler a dispersão)
- **Leitura = só o número.** ✅ "Quando a criticidade sobe, o tempo de resolução tende a subir." ❌ "Chamados críticos demoram porque são complexos" (isso já é **hipótese**, vai para a Etapa 4).
- **Pontos em colunas verticais** = a variável do eixo X tem poucos valores (binária 0/1 ou escala de 1 a 5). O *jitter* espalha um pouco os pontos só para eles ficarem visíveis.
- **Diagonal com pontos próximos da linha** = forte. **Pontos espalhados com uma inclinação** = moderada.

### ✍️ Sua resposta, tabela de correlações
| Par de variáveis | Coeficiente | Leitura (só o que o número diz) |
|---|---|---|
| | | |
| | | |
| | | |
| | | |
| | | |

### 2.5 📋 *"Quais colunas da base ficaram fora da matriz? O que elas poderiam explicar?"*
▶️ Veja também as **ausências de correlação**: a professora lembrou que *"isso também é informação"*.

```python
aus = []
for i, a in enumerate(cols):
    for b in cols[i + 1:]:
        if abs(corr.loc[a, b]) < 0.1 and not ({a, b} <= canais):
            aus.append((a, b, round(corr.loc[a, b], 2)))
print('Pares SEM correlação (|r| < 0,1):')
pd.DataFrame(aus, columns=['Variável 1', 'Variável 2', 'r'])
```

### 💡 Insight: o que fica de fora também conta
- **O que foi excluído** (Id, Status) e **o que nem existe na base** (técnico, nível N1/N2/N3, SLA, nº de transferências, reaberturas, área do colaborador) pode ser a **variável omitida** que explica uma correlação.
- **Ausência de correlação** pode derrubar uma crença da Etapa 1. Ex.: se você esperava que "chamado crítico dá mais trabalho ao colaborador", veja Criticidade × CES.

### ✍️ Sua resposta: colunas fora e o que poderiam explicar
_Clique duas vezes aqui e escreva com as suas palavras._

- 
- 
- 

<details><summary>🔎 <b>Referência</b></summary>

- `Status_Chamado`: constante; a pesquisa só ouve chamados resolvidos (e os não resolvidos? cancelados? reabertos?).
- `Id`: identificador; se houvesse data, daria para ver sazonalidade.
- Canal × Canal: ignorados, porque são negativos por construção.
- Fazem falta: técnico e nível, SLA contratado, transferências, reaberturas, área do colaborador.
- **Ausências:** Criticidade × CES ≈ 0 e Tempo × CES ≈ 0 → o esforço **não** depende da gravidade nem da demora. Criticidade × Canal ≈ 0 → críticos não se concentram em um canal.
</details>

## 03 · Auditoria da IA (10 min)
### 3.1 📋 *"Peçam à IA que interprete a matriz e sugira hipóteses. Depois, auditem cada afirmação como se ela viesse de um analista júnior da sua squad."*

**Prompt sugerido** (use no ChatGPT, Gemini, Copilot ou Claude, anexando a base):
> *Você é um analista de dados. Aplique correlação estatística (Pearson) na base metrica_cx_corr_v2.csv (pesquisa interna de satisfação do Suporte de TI). Liste as correlações maiores que 0,4 ou menores que -0,4, interprete a matriz e sugira hipóteses para o diretor de Suporte.*

### ✍️ Prompt que eu usei (cole aqui)
> 

### ✍️ O que a IA respondeu (resuma as principais afirmações)
1. 
2. 
3. 
4. 
5. 

### 💡 Insight: as três classificações
| Classificação | O que é | Exemplo (sorvete) |
|---|---|---|
| **Constatação** | Só descreve o número | "Temperatura e venda de sorvete têm r = 0,9" |
| **Hipótese** | Explicação ou ação que **ainda precisa ser testada** | "Vale aumentar o estoque no verão?" |
| **Causal indevida** | Afirma **causa** sem evidência | "O calor **causa** as vendas" / Nicolas Cage × afogamentos |

**Sinais de alerta no texto da IA:** "causa", "leva a", "porque", "gera", "aumenta" (afirmado como fato). Use as ferramentas abaixo para **testar** cada afirmação.

### 3.2 🔍 Auditoria A: *"Chamados que demoram mais deixam o colaborador mais satisfeito"?*

```python
explorar('Tempo_Resolucao_h', 'RATINGS', por='Criticidade')
```

### 💡 Insight: Paradoxo de Simpson ⭐
No **geral** a relação é **positiva**, mas **dentro de cada criticidade** ela é **negativa**. A criticidade é uma **variável omitida (confundidora)**: chamados críticos **demoram mais** e **também recebem notas maiores**. Misturando tudo, parece que "demorar é bom".
É exatamente o slide **"Variável Omitida"** da aula (QI → tempo de estudo e nota) e o exemplo do **ITA** (o vestibular como filtro).
🧪 **Teste você mesmo:** troque `RATINGS` por `e_NPS` na célula acima e rode de novo.

### 3.3 🔍 Auditoria B: *"Colaboradores mais velhos têm mais dificuldade: a idade aumenta o esforço (CES)"?*

```python
d['Faixa etária'] = pd.cut(d.Age, [0, 30, 45, 70], labels=['até 30', '31–45', '46+'])
fig, ax = plt.subplots(1, 2, figsize=(14, 4.5))
(pd.crosstab(d['Faixa etária'], d.Canal, normalize='index') * 100).plot(kind='bar', stacked=True, ax=ax[0], rot=0, color=list(CORES_CANAL.values()))
ax[0].set_title('Canal usado por faixa etária (%)'); ax[0].set_ylabel('%')
d.pivot_table(index='Faixa etária', columns='Canal', values='CES', observed=True).plot(kind='bar', ax=ax[1], rot=0, color=list(CORES_CANAL.values()))
ax[1].set_title('CES médio por canal e idade (maior = pior)'); ax[1].set_ylim(1, 5)
plt.tight_layout(); plt.savefig('entrega/04_canal_idade_ces.png', dpi=150); plt.show()
display(d.groupby('Canal')[['Age', 'CES', 'e_NPS', 'RATINGS']].mean().round(2))
```

### 💡 Insight: correlação indireta (controlar por outra variável)
Para saber se é a **idade** ou o **canal**, compare o CES **dentro do mesmo canal** (gráfico da direita). Se as barras do mesmo canal ficam parecidas em todas as idades, **o efeito é do canal**. A idade só **leva** as pessoas ao telefone.
🧪 **Teste:** `explorar('Age', 'CES', por='Canal')`

```python
explorar('Age', 'CES', por='Canal')
```

### 3.4 🔍 Auditoria C: *Pearson é adequado para escalas de 1 a 5?*

```python
sp = num.corr(method='spearman')
comp = rel[['Variável 1', 'Variável 2', 'r']].rename(columns={'r': 'Pearson'})
comp['Spearman'] = [round(sp.loc[a, b], 2) for a, b in zip(comp['Variável 1'], comp['Variável 2'])]
comp['Continua |r| > 0,4?'] = np.where(comp.Spearman.abs() > LIMIAR, '✅', '❌')
comp
```

### 💡 Insight: Pearson × Spearman
- **Pearson** mede relação **linear** entre variáveis contínuas.
- **Spearman** usa a **ordem** (postos) dos valores. É mais adequado para **escalas ordinais** (CES, RATINGS, e_NPS) e mais robusto a outliers.
- Se as duas concordam, a conclusão é **robusta**. Se o valor cai abaixo do corte com Spearman, **desconfie** daquela correlação.

### ✍️ Sua resposta, auditoria
| Afirmação da IA (resumida) | Classificação | Concordamos? Por quê? |
|---|---|---|
| | | |
| | | |
| | | |
| | | |
| | | |

**📋 O que a IA deixou de questionar?**
-

<details><summary>🔎 <b>Referência</b></summary>

- "Demorar mais deixa mais satisfeito" → **causal indevida** (Paradoxo de Simpson).
- "A idade aumenta o esforço" → **causal indevida** (o efeito é do canal).
- "O telefone tem mais esforço e menos satisfação" → **hipótese** (falta medir URA, espera, transferências).
- "e_NPS e RATINGS têm r = 0,89" → **constatação**.
- A IA costuma não questionar: idades = 0, Status constante (viés de seleção), artefato Canal × Canal, Pearson em escala ordinal, a variável omitida criticidade, o SLA dos chamados críticos.
</details>

## 04 · Caderno de hipóteses final
📋 *"As hipóteses que o grupo mantém depois de confrontar a Etapa 1 com os dados e com a auditoria. Na coluna 'Etapa 1', indiquem se a hipótese confirma, contradiz ou é nova."*

▶️ **Laboratório livre:** use `explorar(x, y, por=...)` para testar qualquer hipótese antes de escrevê-la.
Variáveis: `Age`, `Criticidade_num`, `Tempo_Resolucao_h`, `e_NPS`, `CES`, `RATINGS` · grupos: `Criticidade`, `Canal`, `Faixa etária`.

```python
# Exemplos: troque e rode quantas vezes quiser
explorar('Criticidade_num', 'RATINGS', por='Canal')
```

```python
# Painel de médias, útil para dar números concretos às hipóteses
display(d.pivot_table(index='Criticidade', columns='Canal', values='RATINGS').loc[ORDEM_CRIT].round(2).style.background_gradient(cmap='RdYlGn', vmin=1, vmax=5).set_caption('RATINGS médio'))
display(d.groupby('Criticidade')[['Tempo_Resolucao_h', 'e_NPS', 'CES', 'RATINGS']].mean().loc[ORDEM_CRIT].round(2))
```

### 💡 Insight: o que torna uma hipótese boa
1. Está escrita como **pergunta ou afirmação testável** ("Reduzir o tempo **aumenta** a satisfação?").
2. Aponta a **correlação que a sustenta** (com o número).
3. Reconhece o **viés ou a variável omitida possível** (a humildade estatística).
4. Diz **como validar** (dado extra, piloto, teste A/B).
5. **Hipótese que cai não é erro**: registre o que derrubou e por quê.
6. **Viés de confirmação:** tem alguma crença da Etapa 1 que você está "protegendo" mesmo com os dados contra?

### ✍️ Sua resposta, caderno final
| # | Hipótese | Correlação que sustenta | Etapa 1: confirma / contradiz / nova | Viés ou variável omitida possível | Como validaríamos |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

**📋 Hipóteses que derrubamos e por quê:**
-

**📋 Das expectativas da Etapa 1, alguma resistimos a abandonar mesmo com os dados contra?**
-

<details><summary>🔎 <b>Referência</b> (hipóteses possíveis)</summary>

1. Reduzir o tempo de resolução aumenta a satisfação **em todos os níveis de criticidade** (r de −0,49 a −0,57 dentro de cada nível). Variável omitida: criticidade.
2. O Telefone gera mais esforço e menos satisfação, **independentemente da idade** (CES × Telefone +0,65).
3. A idade define o canal; Age × CES é **indireta** (controlando o canal, some).
4. Chamados críticos recebem atendimento diferenciado e são mais bem avaliados (Criticidade × RATINGS +0,59). Falta a variável técnico/nível.
5. Chamados críticos demoram além do SLA? (Criticidade × Tempo +0,89; 48 h × 4,5 h.)
6. RATINGS e e_NPS medem a mesma percepção (+0,89).

**Derrubadas:** "demorar deixa mais satisfeito" e "a idade aumenta o esforço".
</details>

## 05 · Recomendação ao Diretor de Suporte
📋 *"Escolham a hipótese mais forte e escrevam para quem vai decidir. Uma ou duas frases por item."*
O diretor *"não entende de hipóteses nem de correlação"*: fale de **decisão, evidência, experimento e custo**.

▶️ Números para sustentar a recomendação:

```python
tempo_total = d.Tempo_Resolucao_h.sum()
print(f'Horas totais de chamados abertos na amostra: {tempo_total:,.0f} h  (≈ {tempo_total/420:.1f} h por chamado)')
for red in [0.2, 0.3, 0.5]:
    print(f'  Reduzindo {int(red*100)}% do tempo → ≈ {tempo_total*red:,.0f} h de colaboradores a menos com problema aberto')

tel = d.groupby('Canal')[['CES', 'RATINGS', 'e_NPS']].mean().round(2)
print('\nExperiência por canal:'); display(tel)

# Efeito do tempo sobre RATINGS dentro de cada criticidade (inclinação da reta = pontos por hora)
for k in ORDEM_CRIT:
    g = d[d.Criticidade == k]; a, b = np.polyfit(g.Tempo_Resolucao_h, g.RATINGS, 1)
    print(f'{k:>5}: cada 10 h a mais ≈ {a*10:+.2f} ponto no RATINGS (r = {g.Tempo_Resolucao_h.corr(g.RATINGS):+.2f})')
```

### 💡 Insight: como desenhar o experimento (provar causa)
- Correlação **não prova** causa. Para provar, é preciso **intervir** e **comparar com um grupo controle**.
- **Teste A/B:** sortear (**aleatorizar**) metade dos chamados para uma "fila expressa" e a outra metade segue normal. O sorteio garante que as duas metades sejam parecidas em criticidade, idade e canal, e assim a variável omitida some.
- Defina **antes** a métrica de sucesso (ex.: RATINGS médio +0,5) e o prazo (ex.: 8 semanas).
- **Custo de errar**: pense nos dois lados. *Agir e estar errado* (custo de mudar a fila, reversível) × *não agir e estar certo* (colaboradores parados = produtividade perdida, e_NPS em queda).

### ✍️ Sua resposta, recomendação
**Decisão que recomendamos:**
-

**Evidência que temos (e o que ela não prova):**
-

**Experimento para testar se há causa:**
-

**Custo de errar** (se agirmos e a hipótese for falsa; se não agirmos e ela for verdadeira):
-

<details><summary>🔎 <b>Referência</b></summary>

- **Decisão:** tratar o tempo de resolução como alavanca de satisfação: metas de redução por criticidade, começando pelo **Telefone**.
- **Evidência:** dentro de cada criticidade, mais tempo = menos satisfação; Telefone CES 3,75 × Chat 2,24 em qualquer idade. **Não prova causa:** pesquisa observacional, só chamados resolvidos, sem técnico/SLA.
- **Experimento:** piloto de 8 semanas com fila expressa e callback no Telefone × grupo controle sorteado; comparar RATINGS, e_NPS e CES.
- **Custo de errar:** agir e errar = reorganizar a fila (reversível); não agir e acertar = horas de colaboradores paradas, e_NPS caindo, experiência pior para o público 46+.
</details>

## 👥 Contribuições do grupo
| Integrante | RM | Etapas em que contribuiu | Revisei o caderno completo? (✅) |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

## 📤 Como entregar (PDF + notebook)
1. **Rodar tudo:** Ambiente de execução → **Executar tudo** (para os gráficos aparecerem no arquivo).
2. **Notebook:** Arquivo → **Fazer download → Baixar .ipynb**.
3. **PDF do notebook:** Arquivo → **Imprimir** → *Salvar como PDF*.
4. **PDF do template:** copiem as respostas para o `Caderno de Hipóteses.docx`, colem a imagem `entrega/01_heatmap.png` (painel 📁 à esquerda → clique com o botão direito → Baixar) e exportem em PDF.
5. **Portal:** subam o PDF (e o .ipynb, se a professora permitir anexos extras) com os **RMs separados por vírgula**.

## ✍️ Assinatura do caderno
> *"Um bom caderno de hipóteses é um ensaio com a IA como copiloto e um relatório final assinado por você: é quando você filtra e decide o que fazer."* (Profª Tassiana)

Declaramos que as hipóteses e recomendações acima foram **revisadas e decididas pelo grupo**. A IA foi usada como copiloto nas etapas 02 a 05 e **não foi usada na Etapa 1**.

| Nome | RM | Assinatura |
|---|---|---|
| | | |
| | | |
| | | |

**Data:** ___/___/2026

### ✅ Checklist de entrega
- [ ] Etapa 1 preenchida **sem IA**
- [ ] Imagem `entrega/01_heatmap.png` colada no Word
- [ ] Respostas copiadas para o `Caderno de Hipóteses.docx`
- [ ] Exportado em **PDF** e enviado no portal, com os **RMs separados por vírgula**
- [ ] Prazo: até a próxima aula
