import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PerfilAdmin from "./pages/PerfilAdmin"; // ou PerfilUsuario, confira o nome do arquivo
import PrivateRoute from "./components/PrivateRoute"; // <--- OBRIGATÓRIO

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* === ROTAS PÚBLICAS (Qualquer um acessa) === */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* === ROTAS PROTEGIDAS (Só logado acessa) === */}
          {/* O PrivateRoute vai esperar o carregamento do usuário antes de liberar */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/perfil" 
            element={
              <PrivateRoute>
                <PerfilAdmin />
              </PrivateRoute>
            } 
          />

          {/* === REDIRECIONAMENTOS === */}
          {/* Se acessar a raiz, tenta ir pro dashboard (o PrivateRoute vai decidir se manda pro login) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Qualquer rota inexistente manda pro login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}