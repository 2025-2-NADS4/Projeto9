import User from "./User.js";
import Empresa from "./Empresa.js";

// Definir as associações
User.belongsTo(Empresa, {
  foreignKey: 'empresaId',
  as: 'empresa'
});

Empresa.hasMany(User, {
  foreignKey: 'empresaId',
  as: 'usuarios'
});

console.log("✅ Associações entre User e Empresa definidas");