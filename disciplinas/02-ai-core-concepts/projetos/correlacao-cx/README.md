# Correlação CX — caderno de hipóteses

AI Core Concepts · Professora Tassiana Rugoni de Campos. Análise de associação, variável omitida e paradoxo de Simpson na base educacional de atendimento.

## Organização

- `dados/`: CSV da atividade; XLSX de referência fica local e não é enviado ao Git.
- `notebooks/`: versões guiada, Colab e grupo; abrir usando esta pasta como referência dos caminhos relativos.
- `scripts/`: análise e geração de artefatos.
- `entrega/`: análise Markdown e gráficos; Word original/preenchido fica local.

## Executar

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/correlacao.py dados/metrica_cx_corr_v2.csv
```

As dependências abaixo descrevem os imports existentes; não são um lock de ambiente reproduzido nesta organização. Não executar os geradores sobre uma entrega final sem revisão: eles podem sobrescrever artefatos.

Os testes executados no SpeakUp não validam este projeto Python. Correlação não comprova causalidade. CSV tratado como material da atividade; sua origem e a autorização de divulgação pública não foram certificadas. Repositório privado.
