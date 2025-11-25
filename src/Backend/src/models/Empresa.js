import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // ← Importe o sequelize

const Empresa = sequelize.define("Empresa", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  cnpj: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  telefone: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  endereco: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  cidade: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  estado: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  segmento: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  ativa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

export default Empresa;