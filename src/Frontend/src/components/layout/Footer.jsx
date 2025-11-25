export default function Footer() {
  return (
    <footer className="w-full flex-shrink-0 text-center py-6 bg-gradient-to-r from-[#6bb0ff] to-[#0075fc] text-white text-base"> {/* text-sm → text-base */}
      <div className="container mx-auto px-4">
        Desenvolvido por <span className="text-white font-medium">Visio | Insight Dashboard </span> para{" "}
        <span className="text-white font-medium">Cannoli Foodtech</span> ·
        FECAP - Fundação Escola de Comércio Álvares Penteado - Campus Liberdade
      </div>
    </footer>
  );
}