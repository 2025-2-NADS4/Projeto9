import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Building, MapPin, Phone, Shield, Edit3, Save, X, 
  Plus, Briefcase, Users, Trash2
} from "lucide-react";
import { getAllUsers, updateUserRole } from "../api/authApi";
import useTheme from "../hooks/useTheme";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import useAuth from "../hooks/useAuth"; 
import { criarEmpresa, listarEmpresas, vincularUsuario, buscarEmpresa, atualizarEmpresa, removerEmpresa, removerVinculoUsuario } from "../api/empresaApi";

export default function PerfilUsuario() {
  // 1. Pega o usuário logado
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // === ESTADOS (Todos declarados no topo) ===
  const [users, setUsers] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Edição de Usuário
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  
  // Estados de Navegação
  const [activeTab, setActiveTab] = useState("usuarios");
  
  // Estados de Edição/Criação de Empresa
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [isEditingEmpresa, setIsEditingEmpresa] = useState(false); // <--- MOVIDO PARA CÁ
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(""); // <--- ÚNICA DECLARAÇÃO AQUI
  
  const [novaEmpresa, setNovaEmpresa] = useState({
    nome: "", cnpj: "", email: "", telefone: "", 
    endereco: "", cidade: "", estado: "", segmento: ""
  });

  const { isDark, toggleTheme, themeClasses } = useTheme();

  // 3. Carregamento de Dados
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // === ADMIN: Busca tudo ===
        const [usersData, empresasData] = await Promise.all([
          getAllUsers(),
          listarEmpresas()
        ]);
        setUsers(usersData);
        setEmpresas(empresasData);
      } else {
        // === CLIENTE: Busca apenas o seu ===
        setUsers([currentUser]); 

        if (currentUser.empresaId) {
          try {
            console.log("Buscando dados da empresa ID:", currentUser.empresaId);
            const empresaEncontrada = await buscarEmpresa(currentUser.empresaId);
            const arrayEmpresa = Array.isArray(empresaEncontrada) ? empresaEncontrada : [empresaEncontrada];
            setEmpresas(arrayEmpresa);
          } catch (err) {
            console.error("Não foi possível carregar a empresa:", err);
            setEmpresas([]);
          }
        } else {
          setEmpresas([]);
        }
      }
    } catch (error) {
      console.error("Erro geral no loadData:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Funções de Usuário ---
  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setNewRole(user.role);
    // Usa o ID da empresa para o dropdown de usuário
    setSelectedEmpresaId(user.empresaId || (user.empresa ? user.empresa.id : "")); 
  };

  const handleSaveUser = async (userId) => {
    try {
      // 1. Atualiza a Permissão (Role)
      await updateUserRole(userId, newRole);

      // 2. Lógica Inteligente de Vínculo
      if (selectedEmpresaId) {
        // Se tem ID selecionado -> VINCULA
        await vincularUsuario(selectedEmpresaId, userId);
      } else {
        // Se está vazio ("Sem Empresa") -> DESVINCULA
        await removerVinculoUsuario(userId);
      }

      // 3. Atualiza a lista na tela
      setUsers(users.map(u => {
        if (u.id === userId) {
          // Se tiver ID, busca a empresa. Se não, é null.
          const empresaNova = selectedEmpresaId ? empresas.find(e => e.id === selectedEmpresaId) : null;
          
          return { 
            ...u, 
            role: newRole, 
            empresaId: selectedEmpresaId || null, // Garante que fique null no estado
            empresa: empresaNova 
          };
        }
        return u;
      }));

      setEditingUser(null);
      alert("Usuário atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar usuário.");
    }
  };

  // --- Funções de Empresa ---
  const handleDeleteEmpresa = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta empresa?")) {
      try {
        await removerEmpresa(id);
        setEmpresas(empresas.filter(e => e.id !== id));
        alert("Empresa excluída!");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleOpenEditEmpresa = (empresa) => {
    setNovaEmpresa(empresa); 
    setIsEditingEmpresa(true);
    setSelectedEmpresaId(empresa.id); // Reusa o state
    setShowEmpresaModal(true);
  };

  const handleOpenCreateEmpresa = () => {
    setNovaEmpresa({ nome: "", cnpj: "", email: "", telefone: "", endereco: "", cidade: "", estado: "", segmento: "" });
    setIsEditingEmpresa(false);
    setSelectedEmpresaId(null);
    setShowEmpresaModal(true);
  };

  const handleSaveEmpresaForm = async () => {
    try {
      if (isEditingEmpresa) {
         await atualizarEmpresa(selectedEmpresaId, novaEmpresa);
         alert("Empresa atualizada!");
      } else {
         await criarEmpresa(novaEmpresa);
         alert("Empresa criada!");
      }
      setShowEmpresaModal(false);
      loadData(); 
    } catch (error) {
      alert("Erro ao salvar empresa.");
    }
  };

  // --- Renderização ---
  if (loading) {
    return (
      <div className={`${themeClasses.bg} min-h-screen flex items-center justify-center`}>
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.bg} ${themeClasses.text} min-h-screen flex flex-col transition-colors duration-500`}>
      <Header isDark={isDark} toggleTheme={toggleTheme} muted={themeClasses.muted} border={themeClasses.border} />

      <motion.main 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex-1 p-8"
      >
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4899f7] to-[#0075fc] bg-clip-text text-transparent">
              {isAdmin ? "Painel Administrativo" : "Meu Perfil"}
            </h1>
            <p className={`${themeClasses.muted} mt-2`}>
              {isAdmin ? "Gerencie usuários e empresas do sistema." : "Visualize seus dados cadastrais."}
            </p>
          </div>

          {isAdmin ? (
            <div>
              <div className="flex gap-4 mt-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                  onClick={() => setActiveTab("usuarios")}
                  className={`pb-4 px-2 font-medium transition-colors ${activeTab === "usuarios" ? "text-[#0075fc] border-b-2 border-[#0075fc]" : "text-gray-500"}`}
                >
                  <Users size={18} className="inline mr-2"/> Usuários
                </button>
                <button 
                  onClick={() => setActiveTab("empresas")}
                  className={`pb-4 px-2 font-medium transition-colors ${activeTab === "empresas" ? "text-[#0075fc] border-b-2 border-[#0075fc]" : "text-gray-500"}`}
                >
                  <Briefcase size={18} className="inline mr-2"/> Empresas
                </button>
              </div>

              {activeTab === "usuarios" && (
                <div className={`rounded-2xl border ${themeClasses.border} ${isDark ? 'bg-[#1C1C1C]' : 'bg-white'} overflow-hidden`}>
                  <table className="w-full">
                    <thead className={`bg-gray-50 dark:bg-gray-800/50 border-b ${themeClasses.border}`}>
                      <tr>
                        <th className="text-left p-4 font-medium">Usuário</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Empresa</th>
                        <th className="text-left p-4 font-medium">Função</th>
                        <th className="text-left p-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className={`border-b ${themeClasses.border} hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors`}>
                          <td className="p-4 font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              {user.name}
                            </div>
                          </td>
                          <td className="p-4 text-sm opacity-80">{user.email}</td>
                          <td className="p-4">
                            {editingUser === user.id ? (
                              <select
                                value={selectedEmpresaId}
                                onChange={(e) => setSelectedEmpresaId(e.target.value)}
                                className="p-2 border rounded bg-transparent text-sm w-full max-w-[200px] dark:border-gray-600 focus:border-blue-500 outline-none"
                              >
                                <option value="">Sem Empresa</option>
                                {empresas.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Building size={14} className="opacity-50" />
                                <span className="text-sm">
                                  {user.empresa?.nome || user.empresaNome || "Não vinculado"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {editingUser === user.id ? (
                              <select 
                                value={newRole} 
                                onChange={(e) => setNewRole(e.target.value)}
                                className="p-2 border rounded bg-transparent text-sm dark:border-gray-600 focus:border-blue-500 outline-none"
                              >
                                <option value="client">Cliente</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {editingUser === user.id ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleSaveUser(user.id)} className="p-2 bg-green-500/10 text-green-600 rounded"><Save size={16}/></button>
                                <button onClick={() => setEditingUser(null)} className="p-2 bg-red-500/10 text-red-600 rounded"><X size={16}/></button>
                              </div>
                            ) : (
                              <button onClick={() => handleEditUser(user)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded"><Edit3 size={18}/></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "empresas" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Lista de Empresas</h2>
                    <button onClick={handleOpenCreateEmpresa} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                      <Plus size={18}/> Nova Empresa
                    </button>
                  </div>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {empresas.map(emp => (
                      <div key={emp.id} className={`p-5 border rounded-xl ${themeClasses.border} ${isDark ? 'bg-[#1C1C1C]' : 'bg-white'} relative group`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                             <h3 className="font-bold text-lg">{emp.nome}</h3>
                             <p className="text-sm opacity-60 font-mono">{emp.cnpj}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleOpenEditEmpresa(emp)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit3 size={18}/></button>
                            <button onClick={() => handleDeleteEmpresa(emp.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18}/></button>
                          </div>
                        </div>
                        <div className="space-y-1 mt-4 text-sm opacity-80">
                           {emp.cidade && <p>📍 {emp.cidade} - {emp.estado}</p>}
                           {emp.telefone && <p>📞 {emp.telefone}</p>}
                           {emp.email && <p>📧 {emp.email}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-8 rounded-2xl border ${themeClasses.border} ${isDark ? 'bg-[#1C1C1C]' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {currentUser.name?.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h2 className="text-xl font-bold">{currentUser.name}</h2>
                     <p className={`${themeClasses.muted}`}>{currentUser.email}</p>
                   </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="text-blue-500" size={20}/>
                    <span>{currentUser.phone || "Telefone não informado"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="text-blue-500" size={20}/>
                    <span className="capitalize">{currentUser.role === 'client' ? 'Cliente' : currentUser.role}</span>
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-2xl border ${themeClasses.border} ${isDark ? 'bg-[#1C1C1C]' : 'bg-white'} shadow-sm`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Building className="text-blue-500"/> Minha Empresa
                </h3>
                {empresas.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-lg font-semibold">{empresas[0].nome}</p>
                    <p className={`${themeClasses.muted}`}>CNPJ: {empresas[0].cnpj}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <MapPin className="text-gray-400" size={18}/>
                      <span>{empresas[0].cidade} - {empresas[0].estado}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 opacity-60">
                    <p>Você não está vinculado a nenhuma empresa.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal de Empresa - COMPLETADO */}
          {showEmpresaModal && isAdmin && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
               <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto`}>
                 <h3 className="text-lg font-bold mb-4">{isEditingEmpresa ? "Editar Empresa" : "Cadastrar Empresa"}</h3>
                 
                 <div className="space-y-3">
                   <input className="w-full border p-2 rounded dark:bg-gray-700" placeholder="Nome da Empresa *" value={novaEmpresa.nome} onChange={e => setNovaEmpresa({...novaEmpresa, nome: e.target.value})} />
                   <input className="w-full border p-2 rounded dark:bg-gray-700" placeholder="CNPJ" value={novaEmpresa.cnpj} onChange={e => setNovaEmpresa({...novaEmpresa, cnpj: e.target.value})} />
                   <input className="w-full border p-2 rounded dark:bg-gray-700" placeholder="Email" value={novaEmpresa.email} onChange={e => setNovaEmpresa({...novaEmpresa, email: e.target.value})} />
                   <input className="w-full border p-2 rounded dark:bg-gray-700" placeholder="Telefone" value={novaEmpresa.telefone} onChange={e => setNovaEmpresa({...novaEmpresa, telefone: e.target.value})} />
                   <input className="w-full border p-2 rounded dark:bg-gray-700" placeholder="Endereço" value={novaEmpresa.endereco} onChange={e => setNovaEmpresa({...novaEmpresa, endereco: e.target.value})} />
                   <div className="flex gap-2">
                     <input className="w-2/3 border p-2 rounded dark:bg-gray-700" placeholder="Cidade" value={novaEmpresa.cidade} onChange={e => setNovaEmpresa({...novaEmpresa, cidade: e.target.value})} />
                     <input className="w-1/3 border p-2 rounded dark:bg-gray-700" placeholder="Estado" value={novaEmpresa.estado} onChange={e => setNovaEmpresa({...novaEmpresa, estado: e.target.value})} />
                   </div>
                   <input className="w-full border p-2 rounded dark:bg-gray-700" placeholder="Segmento" value={novaEmpresa.segmento} onChange={e => setNovaEmpresa({...novaEmpresa, segmento: e.target.value})} />
                 </div>

                 <div className="flex gap-2 mt-6">
                   <button onClick={handleSaveEmpresaForm} className="bg-blue-600 text-white px-4 py-2 rounded flex-1 hover:bg-blue-700">Salvar</button>
                   <button onClick={() => setShowEmpresaModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded flex-1 hover:bg-gray-600">Cancelar</button>
                 </div>
               </div>
            </div>
          )}

        </div>
      </motion.main>
      <Footer muted={themeClasses.muted} border={themeClasses.border} />
    </div>
  );
}