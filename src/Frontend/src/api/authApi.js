const BASE_URL = "http://localhost:3000/api/auth";

export async function registerUser({ name, email, password, role = "client" }) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!response.ok) throw new Error("Erro ao cadastrar usuário.");
    return await response.json();
  } catch (error) {
    console.error("❌ registerUser error:", error);
    throw error;
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("E-mail ou senha incorretos.");
    return await response.json();
  } catch (error) {
    console.error("❌ loginUser error:", error);
    throw error;
  }
}
// Buscar todos os usuários (apenas admin)
export async function getAllUsers() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/auth/users", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) throw new Error("Falha ao buscar usuários.");
  return await response.json();
}

// Atualizar role do usuário
export async function updateUserRole(userId, newRole) {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:3000/api/auth/users/${userId}/role`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: newRole }),
  });
  
  if (!response.ok) throw new Error("Falha ao atualizar perfil.");
  return await response.json();
}