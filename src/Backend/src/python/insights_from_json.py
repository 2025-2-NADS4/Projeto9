import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone
from sklearn.linear_model import LinearRegression
import warnings
warnings.filterwarnings("ignore")

# =====================================================
# 0️⃣ Leitura dos argumentos (Período e Empresa)
# =====================================================
period = "30d"
empresa_filtro = None

if len(sys.argv) > 1:
    period = sys.argv[1]

if len(sys.argv) > 2:
    empresa_filtro = sys.argv[2]

# Define os arquivos
orders_file = f"orders_{period}.json"
customers_file = "Customer_API_ready.json"
campaigns_file = "Campaign_API_ready.json"
queue_file = "CampaignQueue_API_ready.json"

# =====================================================
# 1️⃣ Leitura e Filtro Inicial
# =====================================================
def load_and_filter(file_path, store_name_filter):
    try:
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
            df = pd.json_normalize(data)
            
            if df.empty: return df

            # Padroniza colunas
            df.columns = df.columns.astype(str).str.lower().str.strip()

            # APLICA O FILTRO SE HOUVER UMA EMPRESA DEFINIDA
            if store_name_filter:
                if "store.name" in df.columns:
                    df = df[df["store.name"] == store_name_filter]
                elif "merchant.name" in df.columns:
                    df = df[df["merchant.name"] == store_name_filter]
            
            return df
    except FileNotFoundError:
        return pd.DataFrame()

orders = load_and_filter(orders_file, empresa_filtro)
customers = load_and_filter(customers_file, empresa_filtro)
campaigns = load_and_filter(campaigns_file, empresa_filtro)
cq = load_and_filter(queue_file, empresa_filtro)

# =====================================================
# 2️⃣ Conversões e validações básicas
# =====================================================

# 1. Clientes: lastorder
if "lastorder" in customers.columns:
    customers["lastorder"] = pd.to_datetime(customers["lastorder"], errors="coerce")

# 2. Pedidos: Data
cols_data_possiveis = ["delivery.deliverydatetime", "createdat", "created_at", "data"]
col_encontrada = None

for col in cols_data_possiveis:
    if col in orders.columns:
        col_encontrada = col
        break

if col_encontrada:
    orders[col_encontrada] = pd.to_datetime(orders[col_encontrada], errors="coerce")
    orders["data_referencia"] = orders[col_encontrada]
else:
    orders["data_referencia"] = pd.NaT

# =====================================================
# 3️⃣ Indicadores gerais
# =====================================================
# Garante que os DataFrames não estão vazios antes de tentar .mean() ou .sum()
if not customers.empty:
    ticket_medio = round(customers["avgticket"].mean(), 2) if "avgticket" in customers.columns else 0
    receita_total = round(customers["totalspent"].sum(), 2) if "totalspent" in customers.columns else 0
    clientes_ativos = customers[customers["status"] == "Active"].shape[0] if "status" in customers.columns else 0
    clientes_inativos = customers[customers["status"] == "Inactive"].shape[0] if "status" in customers.columns else 0
else:
    ticket_medio = 0
    receita_total = 0
    clientes_ativos = 0
    clientes_inativos = 0

# =====================================================
# 4️⃣ Fidelização e comportamento
# =====================================================
hoje = datetime.now(timezone.utc)

# Define o limite de dias conforme o período
if period == "30d": limite_dias = 30
elif period == "60d": limite_dias = 60
elif period == "90d": limite_dias = 90
else: limite_dias = 30

# Calcula inatividade
if "lastorder" in customers.columns and len(customers) > 0:
    clientes_inativos_periodo = customers[customers["lastorder"] < (hoje - timedelta(days=limite_dias))].shape[0]
    taxa_inatividade = round((clientes_inativos_periodo / len(customers)) * 100, 2)
else:
    clientes_inativos_periodo = 0
    taxa_inatividade = 0

# === Clientes reativados ===
clientes_reativados = 0
if "lastorder" in customers.columns and len(customers) > 0:
    clientes_reativados = customers[
        (customers["lastorder"] >= (hoje - timedelta(days=limite_dias * 0.2))) &
        (customers["churnrisk"] == True)
    ].shape[0]

# =====================================================
# 4.5️⃣ Definição de Variáveis para Gráficos
# =====================================================
# Definimos todas as variáveis de cliente que são usadas nos dicionários finais AQUI
clientes_vip = customers[customers["isvip"] == True].shape[0] if "isvip" in customers.columns else 0
clientes_fieis = customers[customers["segment"].str.lower() == "loyal"].shape[0] if "segment" in customers.columns else 0
churn_total = customers[customers["churnrisk"] == True].shape[0] if "churnrisk" in customers.columns else 0

campanhas_inteligentes = {
    "Reativação": int(clientes_reativados),
    "Fidelização": int(clientes_fieis),
    "VIPs": int(clientes_vip),
    "Churn Risk": int(churn_total),
}
# =====================================================
# 5️⃣ Previsão simples de receita (7 dias)
# =====================================================
if not customers.empty and "totalspent" in customers.columns:
    clientes_sorted = customers.sort_values("totalspent", ascending=True)
    dias = np.arange(len(clientes_sorted)).reshape(-1, 1)
    receitas = clientes_sorted["totalspent"].values

    if len(dias) > 1:
        modelo = LinearRegression().fit(dias, receitas)
        dias_futuros = np.arange(len(clientes_sorted), len(clientes_sorted) + 7).reshape(-1, 1)
        previsao_receita = modelo.predict(dias_futuros).clip(min=0)
        datas_previstas = [hoje + timedelta(days=i + 1) for i in range(7)]

        previsao_df = pd.DataFrame({
            "data": datas_previstas,
            "receita_prevista": previsao_receita.round(2)
        })
    else:
        previsao_df = pd.DataFrame()
else:
    previsao_df = pd.DataFrame()

# === 6️⃣ 💬 Campanhas com Maior Engajamento (CORRIGIDO) ===
campanhas_resumo = []
taxa_resp = pd.DataFrame(columns=['campaignid', 'taxa_resposta']) 

if not cq.empty and "response" in cq.columns and "campaignid" in cq.columns:
    
    cq["response_norm"] = cq["response"].astype(str).str.strip().str.lower()
    respostas_positivas = ["sim", "quero", "ok", "recebido", "👍"]
    respostas_negativas = ["nao", "não", "parar", "não tenho interesse", "❌"]

    cq["tem_resposta"] = np.select(
        [
            cq["response_norm"].isin(respostas_positivas),
            cq["response_norm"].isin(respostas_negativas),
        ],
        [1, 0],
        default=np.nan
    )

    taxa_resp = (
        cq.groupby("campaignid", dropna=False)["tem_resposta"]
        .mean()
        .reset_index()
        .rename(columns={"tem_resposta": "taxa_resposta"})
    )

if not campaigns.empty:
    campanhas = campaigns.merge(taxa_resp, left_on="id", right_on="campaignid", how="left")
    print(f"🐍 [DEBUG] Total Campanhas p/ Loja: {len(campanhas)}.")
    
    campanhas["taxa_resposta"] = campanhas["taxa_resposta"].fillna(0.0) 
    
    campanhas["taxa_resposta_%"] = (campanhas["taxa_resposta"] * 100).round(1)

    campanhas_resumo = (
        campanhas[["name", "store.name", "badge", "taxa_resposta_%"]]
        .sort_values("taxa_resposta_%", ascending=False)
        .head(10)
        .rename(columns={"name": "nome", "store.name": "loja", "badge": "tipo"})
        .to_dict(orient="records")
    )
else:
    campanhas_resumo = [] # Mantém vazio se não houver campanhas para a loja

# === 7️⃣ 💡 Sugestões Automáticas ===
recomendacoes = []

def add_sugestao(msg, prioridade):
    recomendacoes.append({"mensagem": msg, "prioridade": prioridade})

# Baseadas em desempenho do cliente filtrado
if clientes_inativos_periodo > 0:
    add_sugestao(f"Envie a campanha 'Volte e Ganhe 10%' para {clientes_inativos_periodo} clientes inativos.", "alta")
if clientes_reativados > 0:
    add_sugestao(f"Parabenize os {clientes_reativados} clientes reativados com um cupom de desconto.", "media")
if clientes_fieis > 0:
    add_sugestao(f"Crie um programa de pontos para {clientes_fieis} clientes fiéis.", "media")
if churn_total > 0:
    add_sugestao(f"Crie uma campanha de retenção para {churn_total} clientes em risco de churn.", "alta")

if not recomendacoes:
    add_sugestao("✅ Nenhuma sugestão urgente no momento.", "baixa")

# =====================================================
# 8️⃣ INSIGHTS DE CAMPANHAS (CORRIGIDO)
# =====================================================
campanha_insights = {
    "taxa_media": 0,
    "melhor_campanha": {"nome": "—", "taxa": 0},
    "pior_campanha": {"nome": "—", "taxa": 0},
    "total_campanhas": 0
}

try:
    if not campaigns.empty and not cq.empty:
        # Debug para stderr para não atrapalhar o JSON
        print("🐍 [DEBUG] Calculando insights de campanhas para cliente...", file=sys.stderr)
        
        # Filtra campanhas publicadas
        campanhas_ativas = campaigns[campaigns["status"] == "Published"]
        total_campanhas = len(campanhas_ativas)
        
        if total_campanhas > 0:
            # Calcula taxa média de conversão
            if "conversionrate" in campanhas_ativas.columns:
                taxa_media = campanhas_ativas["conversionrate"].mean() * 100
                
                # Encontra melhor e pior campanha
                melhor_idx = campanhas_ativas["conversionrate"].idxmax()
                pior_idx = campanhas_ativas["conversionrate"].idxmin()
                
                melhor_campanha = campanhas_ativas.loc[melhor_idx]
                pior_campanha = campanhas_ativas.loc[pior_idx]
                
                campanha_insights = {
                    "taxa_media": float(round(taxa_media, 2)),  # Converte numpy para float
                    "melhor_campanha": {
                        "nome": melhor_campanha.get("name", "N/A"),
                        "taxa": float(round(melhor_campanha.get("conversionrate", 0) * 100, 2))
                    },
                    "pior_campanha": {
                        "nome": pior_campanha.get("name", "N/A"), 
                        "taxa": float(round(pior_campanha.get("conversionrate", 0) * 100, 2))
                    },
                    "total_campanhas": int(total_campanhas)
                }
                
                print(f"🐍 [DEBUG] Insights calculados: {campanha_insights}", file=sys.stderr)
                
except Exception as e:
    print(f"🐍 [Python] Erro ao calcular insights de campanha: {e}", file=sys.stderr)

# =====================================================
# 9️⃣ JSON final (ATUALIZADO)
# =====================================================
insights = {
    "restaurante": empresa_filtro if empresa_filtro else "Geral",
    "resumo_geral": {
        "ticket_medio": float(ticket_medio),
        "receita_total": float(receita_total),
        "clientes_ativos": int(clientes_ativos),
        "clientes_inativos": int(clientes_inativos_periodo),
        "clientes_reativados": int(clientes_reativados),
        "taxa_inatividade": float(taxa_inatividade),
    },
    "previsao_receita": previsao_df.to_dict(orient="records"),
    "campanhas_inteligentes": campanhas_inteligentes,
    "campanha_insights": campanha_insights,  # ← AGORA CORRETO!
    "recomendacoes": recomendacoes,
}

# =====================================================
# 🔟 Exporta e imprime (SOMENTE JSON)
# =====================================================
def convert(obj):
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    elif isinstance(obj, (datetime, pd.Timestamp)):
        return obj.isoformat()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    raise TypeError(f"Tipo não serializável: {type(obj)}")

# Garante encoding UTF-8 para acentos
sys.stdout.reconfigure(encoding='utf-8')

# IMPORANTE: Imprime APENAS o JSON na stdout
json_output = json.dumps(insights, indent=4, ensure_ascii=False, default=convert)
print(json_output)