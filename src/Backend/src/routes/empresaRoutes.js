import express from "express";
import { 
  criarEmpresa, 
  listarEmpresas, 
  vincularUsuario, 
  editarEmpresa,
  buscarEmpresaPorId,
  excluirEmpresa, desvincularUsuario
} from "../controllers/empresaController.js";
import { authenticateToken, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken(), requireAdmin(), criarEmpresa);
router.get("/", authenticateToken(), requireAdmin(), listarEmpresas);
router.put("/:empresaId", authenticateToken(), requireAdmin(), editarEmpresa);
router.post("/:empresaId/usuarios/:userId", authenticateToken(), requireAdmin(), vincularUsuario);
router.delete("/:id", authenticateToken(), requireAdmin(), excluirEmpresa);
router.delete("/usuarios/:userId/vinculo", authenticateToken(), requireAdmin(), desvincularUsuario);

// 2. ROTA CORRIGIDA:
// Tirei o 'empresaController.' da frente e adicionei autenticação básica
// Tirei o 'requireAdmin()' para o cliente não tomar erro 403
router.get('/:id', authenticateToken(), buscarEmpresaPorId);

export default router;