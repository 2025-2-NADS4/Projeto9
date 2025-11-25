import { useState, useEffect, createContext, useContext } from 'react';
// 1. IMPORTANTE: Importamos com os nomes EXATOS do seu authApi.js
import { loginUser, registerUser } from '../api/authApi'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.clear(); 
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("1. Iniciando login..."); // LOG DE DEBUG

      // 2. Chamamos a função loginUser da sua API
      const data = await loginUser({ email, password });
      
      console.log("2. Resposta do Backend:", data); // LOG DE DEBUG

      // Verifica se o backend retornou o token e o usuário
      if (data.token && data.user) {
          console.log("3. Login sucesso! Salvando e redirecionando...");
          
          // Limpa dados antigos
          localStorage.removeItem('user');
          localStorage.removeItem('token');

          // Salva dados novos
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          
          setUser(data.user);
          
          // === AQUI ESTAVA FALTANDO ===
          // Força o navegador a ir para a página inicial/dashboard
          window.location.href = '/dashboard'; 
          
          return { success: true, user: data.user };
      } else {
          console.error("Resposta inválida:", data);
          throw new Error("Resposta do servidor inválida (sem token)");
      }

    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // 3. Chamamos a função registerUser da sua API
      const data = await registerUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'client',
        empresaId: userData.empresaId
      });
      
      // Se o registro já retornar token (login automático), salvamos e redirecionamos
      if (data.token && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          setUser(data.user);
          window.location.href = '/dashboard'; // Redireciona também no cadastro
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login'; 
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export default useAuth;