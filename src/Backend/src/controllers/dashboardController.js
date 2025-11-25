import { getInsights } from "../services/dashboardService.js";
import { generateExport } from "../services/exportService.js";
import { runPythonScript } from "../utils/pythonRunner.js";
import Empresa from "../models/Empresa.js"; // <--- Importante
import path from "path";

export async function handleInsights(req, res) {
  try {
    const { period } = req.params;
    const { channel, region, empresaId } = req.query; 
    
    const userRole = empresaId ? "client" : (req.user?.role || "admin");

    // 1. TRADUÇÃO: Converter ID da empresa (do Front) para Nome (para o Python)
    let nomeEmpresaParaPython = null;

    if (empresaId) {
      const empresaSql = await Empresa.findByPk(empresaId);
      
      if (empresaSql) {
        nomeEmpresaParaPython = empresaSql.nome; // Ex: "La Pasticceria Cannoli"
        console.log(`🏢 [Controller] Traduzido ID ${empresaId} -> Nome: "${nomeEmpresaParaPython}"`);
      } else {
        console.warn(`⚠️ [Controller] Empresa ID ${empresaId} não encontrada no banco.`);
      }
    }

    // 2. CHAMADA AO SERVICE
    // Agora passamos 5 argumentos: Periodo, Role, Canal, Região e o NOME da empresa
    const base = await getInsights(
      period, 
      userRole, 
      channel, 
      region, 
      nomeEmpresaParaPython
    );
    
    // 3. RETORNO
    // Não precisa mais filtrar arrays aqui com .filter(), o Python já fez isso.
    res.json(base);

  } catch (error) {
    console.error("Erro no handleInsights:", error);
    res.status(500).json({ error: "Falha ao obter insights" });
  }
}

export async function handleAlerts(req, res) {
  try {
    const scriptPath = path.resolve("src/python/alerts.py");
    const result = await runPythonScript(scriptPath, [req.params.period]);
    res.json(JSON.parse(result));
  } catch (error) {
    res.status(500).json({ error: "Falha ao gerar alertas" });
  }
}

export async function handleExport(req, res) {
  try {
    await generateExport(req, res);
  } catch (error) {
    res.status(500).json({ error: "Falha ao exportar relatório" });
  }
}