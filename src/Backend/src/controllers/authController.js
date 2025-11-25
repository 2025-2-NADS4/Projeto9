import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Empresa from "../models/Empresa.js";


export const register = async (req, res) => {
  try {
    console.log("📦 Dados recebidos:", req.body);

    // 1. CORREÇÃO: Adicionei 'empresaId' na lista de variáveis recebidas
    const { name, email, password, role = "client", empresaId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "E-mail já cadastrado." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      // 2. PROTEÇÃO: Se empresaId vier vazio, salva como null
      empresaId: empresaId || null 
    });

    res.status(201).json({ message: "Usuário cadastrado com sucesso", newUser });
  } catch (err) {
    console.error("❌ Erro no registro:", err);
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("📥 Login recebido:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "E-mail ou senha incorretos" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "E-mail ou senha incorretos" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login efetuado com sucesso", token, user });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ error: err.message });
  }
};

// Buscar todos os usuários (apenas admin)
export const getAllUsers = async (req, res) => {
  try {
    console.log("👥 Buscando todos os usuários...");

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Empresa,
        as: 'empresa',
        attributes: ['id', 'nome', 'cnpj']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ ${users.length} usuários encontrados`);
    res.json(users);
  } catch (error) {
    console.error("❌ Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Atualizar role do usuário (apenas admin)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    console.log(`🔄 Atualizando role do usuário ${userId} para: ${role}`);

    // Validar role
    if (!['admin', 'client'].includes(role)) {
      return res.status(400).json({ error: "Role inválida. Use 'admin' ou 'client'." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Atualizar role
    user.role = role;
    await user.save();

    // Retornar usuário sem senha
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    console.log(`✅ Role atualizada com sucesso para: ${role}`);
    res.json({ 
      message: "Perfil atualizado com sucesso.",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar role:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};