import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executa o script Python e retorna o JSON de insights processado.
 * * @param {string} period - Período (ex: "30d")
 * @param {string} userRole - "admin" ou "client"
 * @param {string} channel - Filtro de canal (ex: "IFOOD", "WHATSAPP" ou "all")
 * @param {string} region - Filtro de região (ex: "Sul", "Centro" ou "all")
 * @param {string} empresaName - Nome EXATO da empresa para filtrar (ou null se for geral)
 */
export function getInsights(period = "30d", userRole = "client", channel = "all", region = "all", empresaName = null) {
  return new Promise((resolve, reject) => {
    
    // 1. Escolhe o script correto baseado no papel do usuário
    const scriptName = userRole === "admin" ? "insights_admin.py" : "insights_from_json.py";
    const scriptPath = path.resolve(__dirname, `../python/${scriptName}`);

    console.log(`🧠 [Node] Preparando Python: ${scriptName}`);
    console.log(`   - Params: Periodo=${period}, Empresa=${empresaName || 'Geral'}, Canal=${channel}`);

    // 2. Prepara os argumentos na ordem que o Python espera:
    // sys.argv[1] = period
    // sys.argv[2] = empresaName (ou "null")
    // sys.argv[3] = channel
    // sys.argv[4] = region
    const args = [
      scriptPath,
      period,
      empresaName ? empresaName : "null", 
      channel || "all",
      region || "all"
    ];

    // 3. Inicia o processo Python
    const python = spawn("python", args, {
      cwd: path.resolve(__dirname, "../python"), // Garante que o Python ache os JSONs na pasta certa
      env: { ...process.env, PYTHONIOENCODING: "utf-8" }, // Garante acentuação correta
    });

    let data = "";
    let error = "";

    // 🟢 Captura dados (stdout)
    python.stdout.on("data", (chunk) => {
      data += chunk.toString("utf-8");
    });

    // 🔴 Captura erros (stderr)
    python.stderr.on("data", (chunk) => {
      error += chunk.toString("utf-8");
    });

    // ⚙️ Finalização do script
    python.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ [Node] Erro crítico do Python:", error);
        // Mesmo com erro, tentamos ver se o Python cuspiu algum log útil no 'data'
        console.log("🪵 Log parcial:", data); 
        return reject(new Error(error || "Falha na execução do script de análise."));
      }

      try {
        // 🧩 Limpeza e Extração do JSON
        // O Python pode imprimir logs como "🕒 Iniciando..." antes do JSON.
        // Usamos Regex para pegar apenas o objeto JSON final {...}
        const cleaned = data.trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}$/); 

        if (!jsonMatch) {
          // Se não achou JSON, pode ser que o script tenha imprimido apenas logs
          console.error("⚠️ Saída inválida do Python:", data);
          throw new Error("O script Python não retornou um JSON válido.");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log("✅ [Node] JSON recebido e processado com sucesso.");
        resolve(parsed);

      } catch (err) {
        console.error("⚠️ Falha ao fazer parse do JSON:", err);
        console.log("📥 Recebido:", data);
        reject(new Error("Erro ao processar dados analíticos."));
      }
    });
  });
}