/* Página onde o paciente pode consultar as consultas que ele já realizou */

import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { RenderConsultas } from "../components/render-consultas";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Consultas() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
        console.log("Usuário deslogado!");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-6">
                <div className="text-lg mb-4">
                    Olá, <b>Nelson</b>!
                </div>
                <RenderConsultas />
            </main>
        </div>
    );
}