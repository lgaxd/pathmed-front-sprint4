import React, { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { RenderAgendamentos } from "../components/render-agendamentos";
import { ApiSelector } from "../components/api-selector";
import { useAuth } from "../hooks/usar-auth";

export function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth(); // removido logout

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} /> {/* removido onLogout */}
      
      <main className="p-6">
        <ApiSelector />
        <div className="text-lg mb-4">
          Olá, <b>{user?.nomeUsuario || 'Nelson'}</b>!
        </div>
        <RenderAgendamentos />
      </main>
    </div>
  );
}