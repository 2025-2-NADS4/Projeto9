import Empresa from "../models/Empresa.js";
import User from "../models/User.js";

// Criar nova empresa
export const criarEmpresa = async (req, res) => {
  try {
    const { nome, cnpj, email, telefone, endereco, cidade, estado, segmento } = req.body;

    console.log("🏢 Criando nova empresa:", { nome, cnpj });

    // Verificar se CNPJ já existe
    const empresaExistente = await Empresa.findOne({ where: { cnpj } });
    if (empresaExistente) {
      return res.status(400).json({ error: "CNPJ já cadastrado." });
    }

    const novaEmpresa = await Empresa.create({
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      segmento
    });

    res.status(201).json({ 
      message: "Empresa cadastrada com sucesso", 
      empresa: novaEmpresa 
    });
  } catch (error) {
    console.error("❌ Erro ao criar empresa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Listar todas as empresas
export const listarEmpresas = async (req, res) => {
  try {
    console.log("🏢 Buscando todas as empresas...");

    const empresas = await Empresa.findAll({
      include: [{
        model: User,
        as: 'usuarios',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['nome', 'ASC']]
    });

    console.log(`✅ ${empresas.length} empresas encontradas`);
    res.json(empresas);
  } catch (error) {
    console.error("❌ Erro ao listar empresas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Vincular usuário à empresa
export const vincularUsuario = async (req, res) => {
  try {
    const { empresaId, userId } = req.params;

    console.log(`🔗 Vinculando usuário ${userId} à empresa ${empresaId}`);

    const empresa = await Empresa.findByPk(empresaId);
    const user = await User.findByPk(userId);

    if (!empresa || !user) {
      return res.status(404).json({ error: "Empresa ou usuário não encontrado." });
    }

    user.empresaId = empresaId;
    await user.save();

    res.json({ 
      message: "Usuário vinculado à empresa com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        empresa: {
          id: empresa.id,
          nome: empresa.nome
        }
      }
    });
  } catch (error) {
    console.error("❌ Erro ao vincular usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Editar empresa
export const editarEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const dadosAtualizacao = req.body;

    console.log(`✏️ Editando empresa ${empresaId}:`, dadosAtualizacao);

    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) {
      return res.status(404).json({ error: "Empresa não encontrada." });
    }

    await empresa.update(dadosAtualizacao);

    res.json({ 
      message: "Empresa atualizada com sucesso", 
      empresa 
    });
  } catch (error) {
    console.error("❌ Erro ao editar empresa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const buscarEmpresaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🏢 Buscando empresa por ID: ${id}`);

    // Usa o método do Sequelize que você já usa nas outras funções
    const empresa = await Empresa.findByPk(id); 
    
    if (!empresa) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }
    
    res.json(empresa);
  } catch (error) {
    console.error("❌ Erro ao buscar empresa por ID:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Adicione no final do arquivo
export const excluirEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Tentando excluir empresa ID: ${id}`);

    const empresa = await Empresa.findByPk(id);
    if (!empresa) {
      return res.status(404).json({ error: "Empresa não encontrada." });
    }

    await empresa.destroy(); // Remove do banco
    res.json({ message: "Empresa removida com sucesso!" });

  } catch (error) {
    console.error("❌ Erro ao excluir empresa:", error);
    // Erro comum: tentar excluir empresa que tem usuários vinculados
    if (error.name === 'SequelizeForeignKeyConstraintError') {
       return res.status(400).json({ error: "Não é possível excluir esta empresa pois existem usuários vinculados a ela. Desvincule os usuários primeiro." });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const desvincularUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔗 Removendo vínculo do usuário ${userId}`);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Define o ID da empresa como NULL
    user.empresaId = null;
    await user.save();

    res.json({ message: "Vínculo removido com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao desvincular usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};