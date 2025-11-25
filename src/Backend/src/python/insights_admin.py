import pandas as pd
import numpy as np
import json
import warnings
import os
import sys
from datetime import datetime
warnings.filterwarnings("ignore", category=UserWarning, module="pandas")

# =====================================================
# 0️⃣ Leitura de Argumentos e DEBUG
# =====================================================
period = sys.argv[1] if len(sys.argv) > 1 else "30d"
canal_filtro = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "all" else None
regiao_filtro = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] != "all" else None

# Debug: Imprime no terminal do Node o que o Python recebeu
print(f"🐍 [Python] Periodo={period} | Canal={canal_filtro} | Regiao={regiao_filtro}")

# =====================================================
# 1️⃣ Leitura dos arquivos JSON
# =====================================================
def load_json(filename):
    try:
        path = os.path.join(os.path.dirname(__file__), filename)
        return pd.read_json(path)
    except ValueError:
        return pd.DataFrame()

campaign = load_json("Campaign_API_ready.json")
cq = load_json("CampaignQueue_API_ready.json")
customer = load_json("Customer_API_ready.json")
order = load_json("Order_API_ready.json")

# =====================================================
# 2️⃣ Limpeza e padronização
# =====================================================
for df in [campaign, cq, customer, order]:
    if df.empty: continue
    df.columns = df.columns.astype(str).str.lower().str.strip()

if "total.orderamount" not in order.columns: order["total.orderamount"] = 0
if "preparationtime" not in order.columns: order["preparationtime"] = 0

order["total.orderamount"] = pd.to_numeric(order["total.orderamount"], errors="coerce").fillna(0)
order["preparationtime"] = pd.to_numeric(order["preparationtime"], errors="coerce").fillna(0)

if "saleschannel" not in order.columns: order["saleschannel"] = "Desconhecido"
order["saleschannel"] = order["saleschannel"].fillna("Desconhecido").astype(str).str.strip()

# =====================================================
# 🚀 APLICAÇÃO DOS FILTROS
# =====================================================
if not order.empty:
    if canal_filtro:
        # Filtra e printa quantos sobraram
        antes = len(order)
        order = order[order["saleschannel"].str.upper() == canal_filtro.upper()]
        print(f"🐍 [Python] Filtro Canal: de {antes} para {len(order)} pedidos.")

    if regiao_filtro:
        col_regiao = "delivery.region" if "delivery.region" in order.columns else "region"
        if col_regiao in order.columns:
            order = order[order[col_regiao].str.upper() == regiao_filtro.upper()]

# =====================================================
# 3️⃣ Indicadores gerais
# =====================================================
if not order.empty:
    ticket_medio = round(order["total.orderamount"].mean(skipna=True), 2)
    tempo_medio = round(order["preparationtime"].mean(skipna=True), 2)
    total_pedidos = int(order.shape[0])
else:
    ticket_medio = 0
    tempo_medio = 0
    total_pedidos = 0

total_clientes = int(customer.shape[0])

# =====================================================
# 4️⃣ KPIs por loja (CORREÇÃO PARA O GRÁFICO)
# =====================================================
if not order.empty and "store.name" in order.columns:
    kpis_loja = (
        order.groupby(["store.name"], dropna=False)
        .agg(
            pedidos=("total.orderamount", "count"),
            receita=("total.orderamount", "sum"),
            ticket_medio=("total.orderamount", "mean"),
            tempo_medio=("preparationtime", "mean"),
        )
        .reset_index()
        .sort_values("receita", ascending=False)
    )
    kpis_loja[["ticket_medio", "tempo_medio", "receita"]] = kpis_loja[
        ["ticket_medio", "tempo_medio", "receita"]
    ].round(2)
    
    # TRUQUE: Adiciona a coluna saleschannel de volta para o gráfico não quebrar
    # Se tem filtro, usa o nome do filtro. Se não tem, usa "Múltiplos".
    kpis_loja["saleschannel"] = canal_filtro if canal_filtro else "Todos"
    
else:
    kpis_loja = pd.DataFrame(columns=["store.name", "pedidos", "receita", "ticket_medio", "tempo_medio", "saleschannel"])

# =====================================================
# 5️⃣ KPIs por canal de venda
# =====================================================
if not order.empty:
    kpis_canal = (
        order.groupby("saleschannel", dropna=False)
        .agg(
            pedidos=("total.orderamount", "count"),
            receita=("total.orderamount", "sum"),
            ticket_medio=("total.orderamount", "mean"),
            tempo_medio=("preparationtime", "mean"),
        )
        .reset_index()
    )
    kpis_canal[["ticket_medio", "tempo_medio", "receita"]] = kpis_canal[
        ["ticket_medio", "tempo_medio", "receita"]
    ].round(2)
else:
    kpis_canal = pd.DataFrame()

# =====================================================
# 7️⃣ CAMPANHAS COM MAIOR ENGAJAMENTO (NOVA SEÇÃO)
# =====================================================
campanhas_resumo = []

try:
    print("🐍 [DEBUG] Iniciando processamento de campanhas...")
    
    if not campaign.empty and not cq.empty:
        print("🐍 [DEBUG] Ambas as tabelas campaign e cq têm dados")
        
        # Verificar colunas disponíveis
        print("🐍 [DEBUG] Colunas campaign:", campaign.columns.tolist())
        print("🐍 [DEBUG] Colunas cq:", cq.columns.tolist())
        
        # Garantir que temos as colunas necessárias
        required_cq_columns = ["campaignid", "response"]
        required_campaign_columns = ["id", "name"]
        
        if all(col in cq.columns for col in required_cq_columns) and all(col in campaign.columns for col in required_campaign_columns):
            
            # 1. Contar total de interações por campanha
            engajamento = cq["campaignid"].value_counts().reset_index()
            engajamento.columns = ["campaignid", "total_interacoes"]
            print(f"🐍 [DEBUG] Encontradas {len(engajamento)} campanhas com interações")
            
            # 2. Calcular taxa de resposta positiva
            respostas_positivas = cq[cq["response"].str.contains("Sim", na=False)]
            taxas_resposta = respostas_positivas["campaignid"].value_counts().reset_index()
            taxas_resposta.columns = ["campaignid", "respostas_positivas"]
            
            # 3. Combinar dados de engajamento
            engajamento_completo = engajamento.merge(taxas_resposta, on="campaignid", how="left")
            engajamento_completo["respostas_positivas"] = engajamento_completo["respostas_positivas"].fillna(0)
            engajamento_completo["taxa_resposta"] = (engajamento_completo["respostas_positivas"] / engajamento_completo["total_interacoes"]) * 100
            
            print(f"🐍 [DEBUG] Dados combinados: {len(engajamento_completo)} campanhas")
            
            # 4. Juntar com dados das campanhas
            campanhas_com_dados = engajamento_completo.merge(
                campaign, left_on="campaignid", right_on="id", how="inner"
            )
            
            print(f"🐍 [DEBUG] Após merge com campaign: {len(campanhas_com_dados)} campanhas")
            
            # 5. Ordenar por engajamento e pegar top 10
            top_campanhas = campanhas_com_dados.sort_values("total_interacoes", ascending=False).head(10)
            
            print(f"🐍 [DEBUG] Top campanhas: {len(top_campanhas)}")
            
            # 6. Formatar resultado
            for _, row in top_campanhas.iterrows():
                campanha_data = {
                    "nome": row.get("name", "Campanha Sem Nome"),
                    "tipo": row.get("type", "Desconhecido"),
                    "badge": row.get("badge", "default"),
                    "loja": row.get("store.name", "Loja Desconhecida"),
                    "interacoes": int(row["total_interacoes"]),
                    "taxa_resposta": round(float(row["taxa_resposta"]), 2)
                }
                campanhas_resumo.append(campanha_data)
                print(f"🐍 [DEBUG] Campanha adicionada: {campanha_data['nome']}")
                
            print(f"🐍 [Python] {len(campanhas_resumo)} campanhas com engajamento processadas.")
        else:
            print("🐍 [Python] Colunas necessárias não encontradas")
            # Mostrar quais colunas estão faltando
            missing_cq = [col for col in required_cq_columns if col not in cq.columns]
            missing_campaign = [col for col in required_campaign_columns if col not in campaign.columns]
            if missing_cq:
                print(f"🐍 [DEBUG] Faltando em cq: {missing_cq}")
            if missing_campaign:
                print(f"🐍 [DEBUG] Faltando em campaign: {missing_campaign}")
    else:
        if campaign.empty:
            print("🐍 [DEBUG] Tabela campaign está vazia")
        if cq.empty:
            print("🐍 [DEBUG] Tabela cq (CampaignQueue) está vazia")
            
except Exception as e:
    print(f"🐍 [Python] Erro ao processar campanhas: {str(e)}")
    import traceback
    traceback.print_exc()
    campanhas_resumo = []

# =====================================================
# 8️⃣ SUGESTÕES AUTOMÁTICAS (PARA ADMIN)
# =====================================================
recomendacoes = []

def add_sugestao_admin(msg, prioridade):
    recomendacoes.append({
        "mensagem": msg, 
        "prioridade": prioridade,
        "tipo": "sugestao"
    })

try:
    print("🐍 [DEBUG] Gerando sugestões automáticas para admin...")
    
    # 1. Sugestões baseadas no ticket médio
    if ticket_medio > 0:
        if ticket_medio < 50:
            add_sugestao_admin(
                f"Ticket médio baixo (R$ {ticket_medio}). Considere criar combos ou upsell para aumentar o valor médio.",
                "media"
            )
        elif ticket_medio > 150:
            add_sugestao_admin(
                f"Ticket médio alto (R$ {ticket_medio})! Mantenha a qualidade para fidelizar esses clientes.",
                "baixa"
            )
    
    # 2. Sugestões baseadas no tempo de preparo
    if tempo_medio > 0:
        if tempo_medio > 60:
            add_sugestao_admin(
                f"Tempo de preparo elevado ({tempo_medio}min). Otimize processos na cozinha.",
                "alta"
            )
        elif tempo_medio < 30:
            add_sugestao_admin(
                f"Tempo de preparo excelente ({tempo_medio}min)! Destaque isso nas campanhas.",
                "baixa"
            )
    
    # 3. Sugestões baseadas no volume de pedidos
    if total_pedidos > 0:
        if total_pedidos < 100:
            add_sugestao_admin(
                f"Volume baixo ({total_pedidos} pedidos). Considere campanhas de atração.",
                "alta"
            )
        elif total_pedidos > 1000:
            add_sugestao_admin(
                f"Volume alto ({total_pedidos} pedidos)! Invista em fidelização.",
                "baixa"
            )
    
    # 4. Sugestões baseadas nas campanhas
    if len(campanhas_resumo) > 0:
        campanha_top = campanhas_resumo[0] if campanhas_resumo else None
        if campanha_top and campanha_top["taxa_resposta"] > 30:
            add_sugestao_admin(
                f"Campanha '{campanha_top['nome']}' com alta taxa de resposta ({campanha_top['taxa_resposta']}%). Replique a estratégia.",
                "media"
            )
        
        # Verifica se há campanhas com baixa resposta
        campanhas_baixa_resposta = [c for c in campanhas_resumo if c["taxa_resposta"] < 10]
        if campanhas_baixa_resposta:
            add_sugestao_admin(
                f"{len(campanhas_baixa_resposta)} campanha(s) com baixa resposta. Revise a abordagem.",
                "alta"
            )
    
    # 5. Sugestões baseadas nos canais de venda
    if not kpis_canal.empty:
        canal_top = kpis_canal.loc[kpis_canal["receita"].idxmax()]
        canal_menor = kpis_canal.loc[kpis_canal["receita"].idxmin()]
        
        if canal_top["receita"] > canal_menor["receita"] * 3:
            add_sugestao_admin(
                f"Canal {canal_top['saleschannel']} performa muito melhor. Invista mais nele.",
                "media"
            )
    
    # 6. Sugestões baseadas nas lojas
    if not kpis_loja.empty:
        loja_top = kpis_loja.iloc[0]
        if len(kpis_loja) > 1:
            loja_menor = kpis_loja.iloc[-1]
            
            if loja_top["receita"] > loja_menor["receita"] * 5:
                add_sugestao_admin(
                    f"Loja '{loja_top['store.name']}' destaca-se. Estude replicar suas práticas.",
                    "media"
                )
    
    # 7. Sugestão genérica se não houver muitas
    if len(recomendacoes) < 2:
        add_sugestao_admin(
            "Performance estável. Mantenha o monitoramento dos indicadores.",
            "baixa"
        )
        
    print(f"🐍 [DEBUG] {len(recomendacoes)} sugestões geradas para admin")
    
except Exception as e:
    print(f"🐍 [Python] Erro ao gerar sugestões: {e}")
    # Sugestão padrão em caso de erro
    add_sugestao_admin(
        "Analisando dados para sugestões personalizadas...",
        "baixa"
    )
# =====================================================
# 6️⃣ Montagem do JSON final
# =====================================================
resultado = {
    "restaurante": "Painel Administrativo Cannoli",
    "resumo_geral": {
        "ticket_medio_geral": float(ticket_medio) if not np.isnan(ticket_medio) else 0.0,
        "tempo_medio_preparo": float(tempo_medio) if not np.isnan(tempo_medio) else 0.0,
        "total_pedidos": int(total_pedidos),
        "total_clientes": int(total_clientes),
    },
    "lojas_top": kpis_loja.head(10).to_dict(orient="records") if not kpis_loja.empty else [],
    "canais_venda": kpis_canal.to_dict(orient="records") if not kpis_canal.empty else [],
    "campanhas_resumo": campanhas_resumo,  # ← AGORA COM DADOS!
    "recomendacoes": [],
}
recomendacoes = []

# Sugestões baseadas nos dados disponíveis
if ticket_medio > 0 and ticket_medio < 50:
    recomendacoes.append({
        "mensagem": f"Ticket médio baixo (R$ {ticket_medio}). Crie combos para aumentar o valor médio.",
        "prioridade": "media"
    })

if tempo_medio > 60:
    recomendacoes.append({
        "mensagem": f"Tempo de preparo elevado ({tempo_medio}min). Otimizar processos na cozinha.",
        "prioridade": "alta"
    })

if total_pedidos > 1000:
    recomendacoes.append({
        "mensagem": f"Volume alto ({total_pedidos} pedidos)! Foque em fidelização.",
        "prioridade": "baixa"
    })

if len(campanhas_resumo) > 0:
    campanha_top = campanhas_resumo[0]
    recomendacoes.append({
        "mensagem": f"Campanha '{campanha_top['nome']}' lidera com {campanha_top['interacoes']} interações.",
        "prioridade": "media"
    })

# Sugestão padrão se não houver outras
if not recomendacoes:
    recomendacoes.append({
        "mensagem": "Performance estável. Continue monitorando os indicadores.",
        "prioridade": "baixa"
    })

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    
    # Debug final
    print(f"\n🎯 RESUMO FINAL:")
    print(f"   • Campanhas: {len(campanhas_resumo)}")
    print(f"   • Lojas: {len(resultado['lojas_top'])}")
    print(f"   • Canais: {len(resultado['canais_venda'])}")
    
    print(json.dumps(resultado, ensure_ascii=False, indent=2))

