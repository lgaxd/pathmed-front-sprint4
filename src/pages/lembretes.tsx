import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LembreteCard } from "../components/lembrete-card";

export function Lembretes() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        navigate("/login");
        console.log("Usuário deslogado!");
    }
    return (
        <>
            <div>
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
                <Header onMenuClick={() => setSidebarOpen(true)} />
                {/* Conteúdo da página de lembretes */}
                <main className="p-6">
                    <div className="text-lg mb-4">
                        Olá, <b>Nelson</b>! Aqui estão seus lembretes:
                    </div>
                    <LembreteCard
                        titulo="Consulta Médica"
                        descricao="Você tem uma consulta marcada com o Dr. Silva amanhã às 14:00."
                        dataHora="28/09/2025 14:00"
                    />
                    <LembreteCard
                        titulo="Confirmação de E-mail"
                        descricao="Por favor, confirme seu e-mail para continuar recebendo atualizações."
                        dataHora="27/09/2025 18:00"
                    />
                    <LembreteCard
                        titulo="Exame de Rotina"
                        descricao="Está na hora do seu exame de rotina anual. Agende uma consulta."
                        dataHora="01/10/2025 09:00"
                    />
                    <LembreteCard
                        titulo="Vacinação"
                        descricao="Lembrete para tomar a vacina contra a gripe."
                        dataHora="15/10/2025 10:00"
                    />
                    <LembreteCard
                        titulo="Medicamento"
                        descricao="Não esqueça de tomar seu medicamento às 20:00."
                        dataHora="Hoje 20:00"
                    />
                </main>
            </div>
        </>
    );
}
