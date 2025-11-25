import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import sequelize from "./config/database.js";
import { authenticateToken } from "./middlewares/authMiddleware.js";

import User from "./models/User.js";
import Empresa from "./models/Empresa.js";
import "./models/associations.js"; // ← ADICIONE ESTA LINHA


dotenv.config();

const app = express();

// Configuração de CORS com JWT
app.use(cors({
  origin: "http://localhost:3001", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Configuração de body parser + UTF-8
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Rotas públicas (login e cadastro)
app.use("/api/auth", authRoutes);

// Rotas protegidas (dashboard só com token)
app.use("/api/dashboard", authenticateToken(), dashboardRoutes);
app.use("/api/empresas", authenticateToken(), empresaRoutes);

const PORT = process.env.PORT || 3000;

// VOLTE a usar a sincronização aqui:
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Banco de dados sincronizado");
  app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
}).catch(error => {
  console.error("❌ Erro ao sincronizar banco:", error);
});