import { useState } from "react";
// import { useNavigate } from "react-router-dom"; // <-- NÃO PRECISA MAIS (O useAuth vai redirecionar)
import useTheme from "../hooks/useTheme";
import useAuth from "../hooks/useAuth"; // <--- 1. IMPORTAMOS O HOOK
import { Sun, Moon, Contrast, ChevronDown } from "lucide-react";
import Footer from "./../components/layout/Footer.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  // const navigate = useNavigate(); // <-- Removido
  const { isDark, toggleTheme, themeClasses } = useTheme();
  
  // 2. Pegamos a função login do nosso Hook poderoso
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault(); // Mantemos isso para evitar refresh padrão do HTML
    
    // 3. Chamamos a função do Hook (que já tem a lógica nuclear de limpar tudo)
    const resultado = await login(email, senha);

    if (!resultado.success) {
      alert(resultado.error || "Erro ao entrar");
    }
    // Não precisa de navigate("/dashboard") aqui, 
    // pois o useAuth faz window.location.href = '/'
  };

  return (
    <div className={`${themeClasses.bg} ${themeClasses.text} relative min-h-screen flex flex-col items-center justify-between transition-colors duration-500 overflow-hidden`}>
      
      {/* === FAIXA AZUL SUPERIOR === */}
      <div className="w-full h-32 bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] flex flex-col items-center justify-center text-white shadow-lg relative">
        
        {/* Logo e título */}
        <div className="flex items-center gap-3 absolute left-4 top-1/2 transform -translate-y-1/2">
          <img src="/imagens/logo_visio.jpeg" alt="Visio" className="h-8" />
          <span className="text-2xl font-bold tracking-wide text-white">
            Visio | Insight Dashboard
          </span>
        </div>

        <button 
          onClick={toggleTheme} 
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          {isDark ? <Contrast className="text-white" /> : <Contrast className="text-white" />}
        </button>
        
        <h2 className="text-2xl font-bold mb-2">Bem vindo ao Visio!</h2>
        <h2 className="text-xl mb-2 text-sm">Dados que iluminam decisões</h2>
      </div>

      {/* === CONTEÚDO CENTRAL === */}
      <div className="flex-1 flex items-center justify-center w-full py-8">
        <form
          onSubmit={handleLogin}
          className={`${themeClasses.card} border ${themeClasses.border} relative z-10 p-8 rounded-2xl w-[90%] max-w-md shadow-lg transition-colors duration-500`}
        >
          <h2 className="text-2xl font-semibold text-center mb-6 bg-gradient-to-r from-[#4899f7] to-[#0075fc] bg-clip-text text-transparent">
            Entrar
          </h2>

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full mb-4 p-3 rounded-lg bg-transparent border ${themeClasses.border} focus:outline-none focus:border-[#0075fc]`}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={`w-full mb-6 p-3 rounded-lg bg-transparent border ${themeClasses.border} focus:outline-none focus:border-[#0075fc]`}
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] text-white font-medium mb-4 hover:from-[#5aa0ff] hover:to-[#0065e0] transition-all duration-300"
          >
            Acessar
          </button>

          <p className={`text-center text-sm mt-4 ${themeClasses.muted}`}>
            Ainda não tem conta?{" "}
            <span
              onClick={() => window.location.href = "/register"} // Use href aqui também por segurança
              className="text-[#0075fc] cursor-pointer hover:underline font-medium"
            >
              Cadastre-se
            </span>
          </p>
        </form>
      </div>

      {/* === FAIXA AZUL INFERIOR === */}
      <Footer muted={themeClasses.muted} border={themeClasses.border} />
    </div>
  );
}