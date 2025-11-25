# src/python/alerts.py
import sys, json, pandas as pd, numpy as np, os
from datetime import datetime

period = "30d"
if len(sys.argv) > 1:
    period = sys.argv[1]

base_dir = os.path.dirname(__file__)
orders_file = os.path.join(base_dir, f"orders_{period}.json")

if not os.path.exists(orders_file):
    print(json.dumps([{"type": "error", "message": f"Arquivo não encontrado: {orders_file}"}], ensure_ascii=False))
    sys.exit(0)

try:
    orders = pd.read_json(orders_file)
except Exception as e:
    print(json.dumps([{"type": "error", "message": f"Erro ao ler arquivo: {str(e)}"}], ensure_ascii=False))
    sys.exit(0)

def extract_amount(x):
    if isinstance(x, dict):
        return x.get("orderAmount") or x.get("amount") or 0
    return np.nan

if "total" in orders.columns:
    orders["total.orderamount"] = orders["total"].apply(extract_amount)
else:
    col = [c for c in orders.columns if "order" in c.lower() and "amount" in c.lower()]
    if col:
        orders["total.orderamount"] = pd.to_numeric(orders[col[0]], errors="coerce")
    else:
        print(json.dumps([]))
        sys.exit(0)

# === Converte datas ===
date_col = next((c for c in orders.columns if "created" in c.lower() or "date" in c.lower()), None)
if not date_col:
    print(json.dumps([]))
    sys.exit(0)

orders[date_col] = pd.to_datetime(orders[date_col], errors="coerce")
orders["dia"] = orders[date_col].dt.date

# === Receita diária ===
serie = orders.groupby("dia")["total.orderamount"].sum().sort_index()

alerts = []

# === Regras simples ===
if len(serie) > 0:
    media = serie.mean()
    melhor_dia = serie.idxmax()
    pior_dia = serie.idxmin()

    # 1️⃣ Dias sem venda
    if (serie == 0).any():
        dias_sem = serie[serie == 0].index
        for d in dias_sem:
            alerts.append({
                "type": "no_sales",
                "date": str(d),
                "message": f"🚫 Nenhuma venda registrada em {d}."
            })

    # 2️⃣ Receita abaixo da média (menos de 70%)
    for d, v in serie.items():
        if v < media * 0.7 and v > 0:
            alerts.append({
                "type": "below_avg",
                "date": str(d),
                "message": f"⚠️ Receita abaixo da média em {d}: R$ {v:.2f}."
            })

    # 3️⃣ Melhor e pior dia
    if melhor_dia:
        alerts.append({
            "type": "best_day",
            "date": str(melhor_dia),
            "message": f"🏆 Maior receita registrada em {melhor_dia}: R$ {serie[melhor_dia]:.2f}."
        })
    if pior_dia:
        alerts.append({
            "type": "worst_day",
            "date": str(pior_dia),
            "message": f"📉 Menor receita registrada em {pior_dia}: R$ {serie[pior_dia]:.2f}."
        })

    # 4️⃣ Se estiver tudo estável
    if serie.std() < media * 0.05:
        alerts.append({
            "type": "steady",
            "date": str(serie.index[-1]),
            "message": "✅ Receita estável nos últimos dias."
        })

# === Se nada for detectado ===
if len(alerts) == 0:
    alerts = [
        {"type": "info", "date": str(datetime.today().date()), "message": "📊 Nenhuma variação relevante encontrada."}
    ]

print(json.dumps(alerts, ensure_ascii=False))
