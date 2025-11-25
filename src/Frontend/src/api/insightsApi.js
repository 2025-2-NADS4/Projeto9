const BASE_URL = "http://localhost:3000/api/dashboard";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({ 
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}` 
});

// AQUI ESTAVA O PROBLEMA: Melhoramos a lógica para aceitar o ID direto
export async function fetchInsights(period = "30d", paramSegundo = null) {
  
  let queryString = "";

  // 1. Se o segundo parâmetro for uma STRING (o ID da empresa), montamos a query manual
  if (typeof paramSegundo === 'string') {
     queryString = `?empresaId=${paramSegundo}`;
  } 
  // 2. Se for um OBJETO (filtros do admin), usa URLSearchParams
  else if (typeof paramSegundo === 'object' && paramSegundo !== null) {
     const params = new URLSearchParams(paramSegundo);
     queryString = `?${params.toString()}`;
  }

  // Debug para você ver no navegador
  const separator = queryString ? '&' : '?';
  const timestamp = `_t=${new Date().getTime()}`; 
  const urlFinal = `${BASE_URL}/insights/${period}${queryString}${separator}${timestamp}`;
  console.log("📡 FETCH INSIGHTS URL:", urlFinal);

  try {
    const response = await fetch(urlFinal, {
      headers: getHeaders(),
      cache: "no-store"
    });
    
    if (!response.ok) throw new Error("Falha ao buscar insights.");
    return await response.json();
  } catch (error) {
    console.error("❌ fetchInsights error:", error);
    throw error;
  }
}

// ... mantenha as outras funções (fetchAlerts, exportReport) como estavam ...
export async function fetchAlerts(period = "30d") {
  try {
    const response = await fetch(`${BASE_URL}/alerts/${period}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Falha ao buscar alertas.");
    return await response.json();
  } catch (error) {
    console.error("❌ fetchAlerts error:", error);
    throw error;
  }
}

export async function exportReport(type = "csv", period = "30d", filters = {}) {
  const params = new URLSearchParams({ ...filters, type, period });
  try {
    const response = await fetch(`${BASE_URL}/export?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Falha ao exportar relatório.");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_${period}.${type}`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("❌ exportReport error:", error);
    throw error;
  }
}