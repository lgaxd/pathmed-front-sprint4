import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { RenderAgendamentos } from "../components/render-agendamentos";
import { ApiSelector } from "../components/api-selector";
import { useNavigate } from "react-router-dom";

export function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
    console.log("Usuário deslogado!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} onLogout={handleLogout} />

      <main className="p-6">
        <ApiSelector />
        <div className="text-lg mb-4">
          Olá, <b>Nelson</b>!
        </div>
        <RenderAgendamentos />
      </main>
    </div>
  );
}