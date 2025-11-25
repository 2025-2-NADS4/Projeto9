import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import { Sun, Moon, Contrast } from "lucide-react";
import { registerUser } from "../api/authApi";
import Footer from "./../components/layout/Footer.jsx";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { isDark, toggleTheme, themeClasses } = useTheme();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nome || !email || !senha || !confirmarSenha)
      return setErro("Preencha todos os campos.");

    if (senha !== confirmarSenha)
      return setErro("As senhas não coincidem.");

    try {
      await registerUser({ name: nome, email, password: senha, role: "client" });
      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (err) {
      setErro("Erro ao cadastrar: " + err.message);
    }
  };

  return (
    <div className={`${themeClasses.bg} ${themeClasses.text} relative min-h-screen flex flex-col items-center justify-between transition-colors duration-500 overflow-hidden`}>
      
      {/* === FAIXA AZUL SUPERIOR === */}
      <div className="w-full h-32 bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] flex flex-col items-center justify-center text-white shadow-lg relative">
        
        {/* Logo e título NO CANTO ESQUERDO CENTRALIZADO VERTICALMENTE */}
        <div className="flex items-center gap-3 absolute left-4 top-1/2 transform -translate-y-1/2">
          <img src="/imagens/logo_visio.jpeg" alt="Visio" className="h-8" />
          <span className="text-2x1 font-bold tracking-wide text-white">
            Visio | Insight Dashboard
          </span>
        </div>

        <button 
          onClick={toggleTheme} 
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          {isDark ? <Contrast className="text-white" /> : <Contrast className="text-white" />}
        </button>
        
        <h2 className="text-2xl font-bold mb-2">Criar conta</h2>
        <p className="mb-2 text-sm">Junte-se à nossa plataforma</p>
        <button
          onClick={() => navigate("/login")}
          className="border border-white px-6 py-1 rounded-lg text-white hover:bg-white hover:text-[#0075fc] transition font-medium text-sm"
        >
          Já tenho uma conta
        </button>
      </div>

      {/* === CONTEÚDO CENTRAL === */}
      <div className="flex-1 flex items-center justify-center w-full py-8">
        <form
          onSubmit={handleRegister}
          className={`${themeClasses.card} border ${themeClasses.border} relative z-10 p-8 rounded-2xl w-[90%] max-w-md shadow-lg transition-colors duration-500`}
        >
          <h2 className="text-2xl font-semibold text-center mb-6 bg-gradient-to-r from-[#4899f7] to-[#0075fc] bg-clip-text text-transparent">
            Cadastre-se
          </h2>

          {erro && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm rounded-lg p-2 mb-4 text-center">
              {erro}
            </div>
          )}

          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`w-full mb-4 p-3 rounded-lg bg-transparent border ${themeClasses.border} focus:outline-none focus:border-[#0075fc]`}
          />
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
            className={`w-full mb-4 p-3 rounded-lg bg-transparent border ${themeClasses.border} focus:outline-none focus:border-[#0075fc]`}
          />
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className={`w-full mb-6 p-3 rounded-lg bg-transparent border ${themeClasses.border} focus:outline-none focus:border-[#0075fc]`}
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] text-white font-medium mb-4 hover:from-[#5aa0ff] hover:to-[#0065e0] transition-all duration-300"
          >
            Cadastrar
          </button>

          <p className={`text-center text-sm mt-4 ${themeClasses.muted}`}>
            Já tem conta?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[#0075fc] cursor-pointer hover:underline font-medium"
            >
              Entrar
            </span>
          </p>
        </form>
      </div>

      {/* === FAIXA AZUL INFERIOR === */}
      <Footer muted={themeClasses.muted} border={themeClasses.border} />
    </div>
  );
}