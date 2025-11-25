const BASE_URL = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("token");
const getHeaders = () => ({ 
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json"
});

export async function criarEmpresa(empresaData) {
  try {
    const response = await fetch(`${BASE_URL}/empresas`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(empresaData),
    });
    if (!response.ok) throw new Error("Falha ao criar empresa.");
    return await response.json();
  } catch (error) {
    console.error("❌ criarEmpresa error:", error);
    throw error;
  }
}

export async function listarEmpresas() {
  try {
    const response = await fetch(`${BASE_URL}/empresas`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Falha ao buscar empresas.");
    return await response.json();
  } catch (error) {
    console.error("❌ listarEmpresas error:", error);
    throw error;
  }
}

export async function vincularUsuario(empresaId, userId) {
  try {
    const response = await fetch(`${BASE_URL}/empresas/${empresaId}/usuarios/${userId}`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Falha ao vincular usuário.");
    return await response.json();
  } catch (error) {
    console.error("❌ vincularUsuario error:", error);
    throw error;
  }
}
export async function buscarEmpresa(id) {
  try {
    const response = await fetch(`${BASE_URL}/empresas/${id}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
       // Se der 403 ou 404, lançamos erro para tratar no front
       throw new Error("Falha ao buscar detalhes da empresa.");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ buscarEmpresa error:", error);
    throw error;
  }
}
// Função para Editar (PUT)
export async function atualizarEmpresa(id, dados) {
  try {
    const response = await fetch(`${BASE_URL}/empresas/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Falha ao atualizar empresa.");
    return await response.json();
  } catch (error) {
    console.error("❌ atualizarEmpresa error:", error);
    throw error;
  }
}

// Função para Excluir (DELETE)
export async function removerEmpresa(id) {
  try {
    const response = await fetch(`${BASE_URL}/empresas/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    // Se der erro 400 (ex: tem usuário vinculado), lemos a mensagem do backend
    if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Falha ao excluir empresa.");
    }
    return await response.json();
  } catch (error) {
    console.error("❌ removerEmpresa error:", error);
    throw error;
  }
}
export async function removerVinculoUsuario(userId) {
  try {
    const response = await fetch(`${BASE_URL}/empresas/usuarios/${userId}/vinculo`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Falha ao desvincular usuário.");
    return await response.json();
  } catch (error) {
    console.error("❌ removerVinculoUsuario error:", error);
    throw error;
  }
}