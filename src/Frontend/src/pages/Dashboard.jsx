import React from "react";
import DashboardAdmin from "./DashboardAdmin";
import DashboardClient from "./DashboardClient";
import useAuth from "../hooks/useAuth"; // <--- 1. Importamos o Hook que controla o login

export default function Dashboard() {
  // 2. Em vez de ler localStorage na mão, usamos o estado global.
  // Assim, quando você clica em "Entrar", essa variável muda sozinha.
  const { user, loading } = useAuth();

  // Enquanto verifica o token, mostra uma tela vazia ou loading
  if (loading) {
    return <div className="min-h-screen bg-gray-100 dark:bg-[#121212]" />;
  }

  // Se não tiver usuário, não renderiza nada (ou poderia redirecionar)
  if (!user) return null;

  return user.role === "admin" ? (
    <DashboardAdmin />
  ) : (
    // 3. O SEGREDO: key={user.id}
    // Isso obriga o React a destruir a tela do usuário anterior e criar uma novinha
    // para o novo usuário. Nenhum dado antigo sobrevive a isso.
    <DashboardClient key={user.id} />
  );
}