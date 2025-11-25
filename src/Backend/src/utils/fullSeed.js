import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import Empresa from '../models/Empresa.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PASTA_PYTHON = path.join(__dirname, '../python');

// === LISTA DE DADOS REALISTAS ===
const LISTA_EMPRESAS = [
  { nome: "La Pasticceria Cannoli", segmento: "Doceria", perfil: "alto" },
  { nome: "Sushi Yamamoto", segmento: "Japonês", perfil: "alto" },
  { nome: "Luigi's Trattoria", segmento: "Italiana", perfil: "medio" },
  { nome: "Burger House Artesanal", segmento: "Hamburgueria", perfil: "medio" },
  { nome: "Veggie Life Saudável", segmento: "Saudável", perfil: "baixo" },
  { nome: "Churrascaria Boi na Brasa", segmento: "Carnes", perfil: "alto" },
  { nome: "Açaí da Praia", segmento: "Doceria", perfil: "medio" },
  { nome: "Taco Loco Mexicano", segmento: "Mexicana", perfil: "baixo" },
  { nome: "Padaria do Seu Manuel", segmento: "Padaria", perfil: "alto" },
  { nome: "Café Aroma & Grão", segmento: "Cafeteria", perfil: "baixo" }
];

const NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Felipe", "Gabriela", "Henrique", "Isabela", "João", "Karen", "Leonardo", "Marina", "Natália", "Otávio", "Paula", "Rafael", "Sabrina", "Tiago", "Vitória"];
const SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Ferreira", "Costa", "Almeida", "Gomes"];

const CAMPANHAS_MODELO = [
  { nome: "Volte e Ganhe 10%", type: "Loyalty", badge: "reactivation" },
  { nome: "Combo Família", type: "Product", badge: "product" },
  { nome: "Semana do Frete Grátis", type: "Seasonal", badge: "seasonal" },
  { nome: "Cliente VIP Premium", type: "Loyalty", badge: "loyalty" },
  { nome: "Happy Hour Especial", type: "Timing", badge: "timing" }
];

const CANAIS = ["IFOOD", "WHATSAPP", "SITE", "RAPPI"];
const REGIOES = ["Sul", "Norte", "Leste", "Oeste", "Centro"];

// === FUNÇÕES AUXILIARES ===
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const gerarNome = () => `${pickOne(NOMES)} ${pickOne(SOBRENOMES)}`;

// Função para filtrar dados por data (retroativamente)
const filtrarPorDias = (lista, dias, campoData = 'createdAt') => {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);
  return lista.filter(item => new Date(item[campoData]) >= dataLimite);
};

const fullSeed = async () => {
  try {
    console.log("\n🧨 INICIANDO O SEED 30/60/90 DIAS...");
    
    // 1. Limpar Banco
    await sequelize.sync({ force: true });
    console.log("✅ Banco de dados limpo.");

    // 2. Criar Admin
    const passHash = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Administrador",
      email: "admin@admin.com",
      password: passHash,
      role: "admin"
    });
    console.log("✅ Admin criado: admin@admin.com");

    // Arrays globais (vão conter dados de até 90 dias)
    let allOrders = [];
    let allCampaigns = [];
    let allCustomers = [];
    let allCampaignQueue = [];

    // 3. Loop das Empresas
    for (const empData of LISTA_EMPRESAS) {
      
      const cnpjFalso = Math.floor(Math.random() * 10000000000000).toString();
      const novaEmpresa = await Empresa.create({
        nome: empData.nome,
        cnpj: cnpjFalso,
        email: `contato@${empData.nome.split(' ')[0].toLowerCase()}.com`,
        telefone: `119${random(1000,9999)}${random(1000,9999)}`,
        endereco: `Rua Exemplo, ${random(1, 500)}`,
        cidade: "São Paulo",
        estado: "SP",
        segmento: empData.segmento
      });

      const emailUser = `${empData.nome.split(' ')[0].toLowerCase()}@teste.com`;
      await User.create({
        name: `Dono ${empData.nome.split(' ')[0]}`,
        email: emailUser,
        password: passHash,
        role: "client",
        empresaId: novaEmpresa.id
      });

      console.log(`🏢 ${empData.nome} criada (Login: ${emailUser})`);

      // Aumentamos o volume para cobrir 90 dias
      let qtdPedidos, qtdClientes, rangeTicket;
      
      if (empData.perfil === "alto") {
        qtdPedidos = random(400, 600); // Mais pedidos para cobrir 3 meses
        qtdClientes = random(100, 150);
        rangeTicket = [80, 200];
      } else if (empData.perfil === "medio") {
        qtdPedidos = random(150, 300);
        qtdClientes = random(50, 90);
        rangeTicket = [50, 100];
      } else {
        qtdPedidos = random(50, 100);
        qtdClientes = random(20, 40);
        rangeTicket = [30, 60];
      }

      // A. Gerar Pedidos (0 a 90 dias atrás)
      for (let i = 0; i < qtdPedidos; i++) {
        allOrders.push({
          id: `ORD-${random(100000, 999999)}`,
          "store.name": empData.nome,
          merchant: { name: empData.nome, id: novaEmpresa.id, doc: cnpjFalso },
          saleschannel: pickOne(CANAIS),
          "delivery.region": pickOne(REGIOES),
          "total.orderamount": parseFloat(randomFloat(rangeTicket[0], rangeTicket[1])),
          total: { orderAmount: parseFloat(randomFloat(rangeTicket[0], rangeTicket[1])) },
          // MUDANÇA: Gera datas de até 90 dias atrás
          createdAt: new Date(Date.now() - random(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
          preparationTime: random(25, 70)
        });
      }

      // B. Gerar Clientes
      for (let k = 0; k < qtdClientes; k++) {
         const status = Math.random() > 0.2 ? "Active" : "Inactive";
         allCustomers.push({
            id: `CUST_${random(1000, 9999)}`,
            name: gerarNome(),
            status: status,
            totalSpent: parseFloat(randomFloat(200, 1000)),
            totalOrders: random(1, 15),
            avgTicket: parseFloat(randomFloat(rangeTicket[0], rangeTicket[1])),
            churnRisk: status === "Inactive" ? true : (Math.random() > 0.8),
            isVIP: Math.random() > 0.85,
            segment: Math.random() > 0.6 ? "Loyal" : "Regular",
            lastOrder: new Date(Date.now() - random(0, 90) * 24 * 60 * 60 * 1000).toISOString(),
            "store.name": empData.nome,
            merchant: { name: empData.nome }
         });
      }

      // C. Campanhas
      const qtdCampanhas = empData.perfil === "alto" ? 5 : 2;
      for (let c = 0; c < qtdCampanhas; c++) {
        const modelo = CAMPANHAS_MODELO[c % CAMPANHAS_MODELO.length];
        const campId = `CMP-${random(1000, 9999)}`;
        const conversao = parseFloat(randomFloat(0.05, 0.4));

        allCampaigns.push({
           id: campId,
           name: modelo.nome,
           type: modelo.type,
           status: "Published",
           conversionRate: conversao,
           "store.name": empData.nome,
           badge: modelo.badge
        });

        const interacoes = Math.floor(qtdClientes * (Math.random() * 0.5));
        for (let x = 0; x < interacoes; x++) {
            allCampaignQueue.push({
                id: `JOB_${random(10000,99999)}`,
                campaignId: campId,
                "store.name": empData.nome,
                response: Math.random() < conversao ? "Sim, quero!" : "Não tenho interesse",
                status: 2,
                updatedAt: new Date().toISOString()
            });
        }
      }
    } 

    // 4. SALVAR ARQUIVOS INTELIGENTES (30, 60, 90 dias)
    await fs.mkdir(PASTA_PYTHON, { recursive: true });

    // Salva os arquivos "Mestres" (API Ready) com tudo
    await fs.writeFile(path.join(PASTA_PYTHON, 'Order_API_ready.json'), JSON.stringify(allOrders, null, 2));
    await fs.writeFile(path.join(PASTA_PYTHON, 'Campaign_API_ready.json'), JSON.stringify(allCampaigns, null, 2));
    await fs.writeFile(path.join(PASTA_PYTHON, 'Customer_API_ready.json'), JSON.stringify(allCustomers, null, 2));
    await fs.writeFile(path.join(PASTA_PYTHON, 'CampaignQueue_API_ready.json'), JSON.stringify(allCampaignQueue, null, 2));

    // --- GERAÇÃO DOS ARQUIVOS POR PERÍODO ---
    console.log("📅 Gerando arquivos temporais...");

    const periodos = [30, 60, 90];
    
    for (const dias of periodos) {
        // Filtra os pedidos
        const ordersFiltrados = filtrarPorDias(allOrders, dias, 'createdAt');
        await fs.writeFile(path.join(PASTA_PYTHON, `orders_${dias}d.json`), JSON.stringify(ordersFiltrados, null, 2));

        // Filtra os clientes (baseado na última compra)
        const customersFiltrados = filtrarPorDias(allCustomers, dias, 'lastOrder');
        await fs.writeFile(path.join(PASTA_PYTHON, `customers_${dias}d.json`), JSON.stringify(customersFiltrados, null, 2));
    }

    console.log(`\n✅ GERAÇÃO FINALIZADA!`);
    console.log(`📊 Dados de 90 dias gerados e fatiados em 30/60/90.`);
    console.log(`🔑 Login Cannoli: la@teste.com (Senha: 123456)`);

  } catch (error) {
    console.error("❌ Erro:", error);
  }
};

fullSeed();