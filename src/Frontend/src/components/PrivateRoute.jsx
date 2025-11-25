import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. Se estiver carregando (verificando token no localStorage), 
  // mostra um spinner e NÃO REDIRECIONA AINDA.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#121212]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Se terminou de carregar e NÃO tem usuário -> Manda pro Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 3. Se tem usuário -> Mostra a página protegida (Dashboard)
  return children;
}