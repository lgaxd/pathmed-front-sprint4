import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { RenderConsultas } from "../components/render-consultas";
import { useState } from "react";
import { useAuth } from "../hooks/usar-auth";

export function Consultas() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Minhas Consultas</h1>
                    <p className="text-gray-600">
                        Olá, <b>{user?.nomeUsuario || 'Paciente'}</b>! Aqui está o histórico das suas consultas.
                    </p>
                </div>
                <RenderConsultas />
            </main>
        </div>
    );
}