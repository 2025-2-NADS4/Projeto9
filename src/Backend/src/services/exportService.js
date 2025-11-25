import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Parser as Json2Csv } from "json2csv";
import { getInsights } from "./dashboardService.js"

/**
 * Gera o relatório completo (CSV, XLSX ou PDF)
 * incluindo os períodos de 30, 60 e 90 dias.
 */
export async function generateExport(req, res) {
  const { type = "csv", period = "30d" } = req.query;

  // 🔹 Coleta todos os períodos
  const periods = ["30d", "60d", "90d"];
  const datasets = {};

  for (const p of periods) {
    try {
      datasets[p] = await getInsights(p, "admin");
    } catch (err) {
      console.warn(`⚠️ Falha ao obter dados de ${p}:`, err.message);
      datasets[p] = null;
    }
  }

  // 🔹 Seleciona o formato
  if (type === "xlsx") return generateExcel(datasets, res);
  if (type === "pdf") return generatePDF(datasets, res);
  return generateCSV(datasets, res);
}

function generateCSV(datasets, res) {
  const parser = new Json2Csv();
  const combined = [];

  for (const [period, data] of Object.entries(datasets)) {
    if (!data?.lojas_top) continue;
    data.lojas_top.forEach((item) =>
      combined.push({ period, ...item })
    );
  }

  const csv = parser.parse(combined);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="relatorio_completo.csv"`);
  res.status(200).send(csv);
}

async function generateExcel(datasets, res) {
  const wb = new ExcelJS.Workbook();

  for (const [period, data] of Object.entries(datasets)) {
    if (!data) continue;

    const ws = wb.addWorksheet(`Lojas ${period}`);
    ws.columns = [
      { header: "Loja", key: "store.name", width: 28 },
      { header: "Pedidos", key: "pedidos", width: 12 },
      { header: "Receita", key: "receita", width: 14 },
      { header: "Ticket Médio", key: "ticket_medio", width: 16 },
      { header: "Tempo Médio", key: "tempo_medio", width: 14 },
    ];
    (data.lojas_top || []).forEach((r) => ws.addRow(r));

    const ws2 = wb.addWorksheet(`Canais ${period}`);
    ws2.columns = [
      { header: "Canal", key: "saleschannel", width: 20 },
      { header: "Pedidos", key: "pedidos", width: 12 },
      { header: "Receita", key: "receita", width: 14 },
      { header: "Ticket Médio", key: "ticket_medio", width: 16 },
    ];
    (data.canais_venda || []).forEach((r) => ws2.addRow(r));
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", 'attachment; filename="relatorio_completo.xlsx"');
  await wb.xlsx.write(res);
  res.end();
}

async function generatePDF(datasets, res) {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="relatorio_completo.pdf"');
  doc.pipe(res);

  doc.fontSize(18).text("📊 Relatório Cannoli Consolidado", { align: "center" }).moveDown();

  for (const [period, data] of Object.entries(datasets)) {
    if (!data) continue;

    doc
      .fontSize(14)
      .fillColor("#FF8C00")
      .text(`🔸 Período: ${period}`, { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Ticket médio: R$ ${data?.resumo_geral?.ticket_medio_geral || 0}`)
      .text(`Tempo médio de preparo: ${data?.resumo_geral?.tempo_medio_preparo || 0} min`)
      .moveDown(0.5)
      .text("Top Lojas:", { bold: true });

    (data.lojas_top || []).slice(0, 10).forEach((l, i) =>
      doc.text(
        `${i + 1}. ${l["store.name"]} — R$ ${Number(l.receita).toFixed(2)}`,
        { indent: 10 }
      )
    );

    doc.moveDown(1);
  }

  doc.end();
}
