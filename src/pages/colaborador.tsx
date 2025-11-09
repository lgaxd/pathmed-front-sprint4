import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useAuth } from "../hooks/usar-auth";
import { ApiSelector } from "../components/api-selector";
import { useNavigate } from "react-router-dom";

export function Colaborador() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dados mock para demonstração
  const estatisticas = [
    { titulo: "Consultas Hoje", valor: "24", icone: "📊" },
    { titulo: "Pacientes Atendidos", valor: "18", icone: "👥" },
    { titulo: "Agendamentos Pendentes", valor: "7", icone: "⏰" },
    { titulo: "Teleconsultas", valor: "12", icone: "💻" }
  ];

  const atividadesRecentes = [
    { id: 1, acao: "Consulta agendada", paciente: "Maria Silva", horario: "10:30" },
    { id: 2, acao: "Teleconsulta realizada", paciente: "João Santos", horario: "09:15" },
    { id: 3, acao: "Prontuário atualizado", paciente: "Ana Costa", horario: "08:45" },
    { id: 4, acao: "Exame solicitado", paciente: "Pedro Oliveira", horario: "14:20" }
  ];

  const handleVerAgendamentos = () => {
    navigate('/agendamentos');
  };

  const handleNovoAgendamento = () => {
    navigate('/novo-agendamento');
  };

  const handleRelatorios = () => {
    navigate('/relatorios');
  };

  const handleGerenciarPacientes = () => {
    navigate('/pacientes');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="p-6">
        <ApiSelector />
        
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Painel do Colaborador
          </h1>
          <p className="text-gray-600">
            Bem-vindo(a), <b>{user?.nomeUsuario || 'Colaborador'}</b>! Aqui está o resumo das atividades.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {estatisticas.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">{stat.icone}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{stat.titulo}</h3>
              <p className="text-2xl font-bold text-blue-600">{stat.valor}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Atividades Recentes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Atividades Recentes
            </h2>
            <div className="space-y-4">
              {atividadesRecentes.map((atividade) => (
                <div key={atividade.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{atividade.acao}</p>
                    <p className="text-sm text-gray-600">{atividade.paciente}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {atividade.horario}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Ações Rápidas
            </h2>
            <div className="space-y-3">
              <button 
                onClick={handleVerAgendamentos}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-800">📋 Ver Agendamentos</span>
                <p className="text-sm text-gray-600 mt-1">Visualize todos os agendamentos do dia</p>
              </button>
              
              <button 
                onClick={handleNovoAgendamento}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-800">➕ Novo Agendamento</span>
                <p className="text-sm text-gray-600 mt-1">Agende consulta para paciente</p>
              </button>
              
              <button 
                onClick={handleRelatorios}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-800">📊 Relatórios</span>
                <p className="text-sm text-gray-600 mt-1">Acesse relatórios de atendimento</p>
              </button>
              
              <button 
                onClick={handleGerenciarPacientes}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-800">👥 Gerenciar Pacientes</span>
                <p className="text-sm text-gray-600 mt-1">Administre cadastros de pacientes</p>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}