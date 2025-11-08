import { ListaAgendamentos } from "./lista-agendamentos";
import type { Agendamento } from "../types/agendamento";
import { useApiService } from "../hooks/usar-api-service";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/usar-auth";

export function RenderAgendamentos() {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = useApiService();
  const { user } = useAuth();

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        setLoading(true);
        // Se temos um usuário logado, buscar consultas específicas do paciente
        if (user?.idUsuario) {
          const consultasData = await apiService.getConsultasPorPaciente(user.idUsuario);
          setConsultas(consultasData);
        } else {
          // Fallback: buscar todas as consultas
          const consultasData = await apiService.getConsultas();
          setConsultas(consultasData);
        }
      } catch (err) {
        console.error('Error fetching consultations:', err);
        // Dados mock para desenvolvimento
        setConsultas(getMockConsultas());
        setError('Erro ao carregar consultas. Mostrando dados de exemplo.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [apiService, user]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Carregando consultas...</p>
      </div>
    );
  }

  // Transformar dados da API para o formato do componente
  const agendamentosHoje: Agendamento[] = consultas
    .filter(consulta => {
      try {
        const consultaDate = new Date(consulta.dataHoraConsulta || consulta.data);
        const hoje = new Date();
        return consultaDate.toDateString() === hoje.toDateString();
      } catch {
        return false;
      }
    })
    .map(consulta => ({
      id: consulta.idConsulta?.toString() || consulta.id,
      rghcPaciente: consulta.idPaciente?.toString() || user?.idUsuario?.toString() || "123456",
      especialidade: consulta.especialidade || consulta.descricaoEspecialidade || "Consulta Geral",
      data: consulta.dataHoraConsulta?.split('T')[0] || consulta.data,
      horario: consulta.dataHoraConsulta?.split('T')[1]?.substring(0, 5) || consulta.horario || "09:00",
      status: getStatusText(consulta.idStatus || consulta.status),
      medicoNome: consulta.medicoNome || consulta.nomeProfissionalSaude || "Dr. Médico"
    }));

  const agendamentosFuturos: Agendamento[] = consultas
    .filter(consulta => {
      try {
        const consultaDate = new Date(consulta.dataHoraConsulta || consulta.data);
        const hoje = new Date();
        return consultaDate > hoje && consultaDate.toDateString() !== hoje.toDateString();
      } catch {
        return false;
      }
    })
    .map(consulta => ({
      id: consulta.idConsulta?.toString() || consulta.id,
      rghcPaciente: consulta.idPaciente?.toString() || user?.idUsuario?.toString() || "123456",
      especialidade: consulta.especialidade || consulta.descricaoEspecialidade || "Consulta Geral",
      data: consulta.dataHoraConsulta?.split('T')[0] || consulta.data,
      horario: consulta.dataHoraConsulta?.split('T')[1]?.substring(0, 5) || consulta.horario || "09:00",
      status: getStatusText(consulta.idStatus || consulta.status),
      medicoNome: consulta.medicoNome || consulta.nomeProfissionalSaude || "Dr. Médico"
    }));

  return (
    <div className="p-6">
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <ListaAgendamentos 
        agendamentos={agendamentosHoje} 
        titulo="Hoje" 
      />
      
      <ListaAgendamentos 
        agendamentos={agendamentosFuturos} 
        titulo="Próximos Dias" 
      />

      {/* Botão para agendar nova consulta */}
      <div className="mt-8 text-center">
        <button
          onClick={() => window.location.href = '/agendar-consulta'}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow cursor-pointer transition-colors duration-200"
        >
          Agendar Nova Consulta
        </button>
      </div>
    </div>
  );
}

function getStatusText(statusId: number | string): "Agendado" | "Cancelado" | "Concluído" {
  if (typeof statusId === 'string') {
    return statusId as "Agendado" | "Cancelado" | "Concluído";
  }
  
  switch (statusId) {
    case 1: return "Agendado";
    case 4: return "Concluído";
    case 5: return "Cancelado";
    default: return "Agendado";
  }
}

// Dados mock para desenvolvimento
function getMockConsultas() {
  return [
    {
      idConsulta: 1,
      idPaciente: 1,
      dataHoraConsulta: new Date().toISOString(),
      idStatus: 1,
      especialidade: "Cardiologia",
      medicoNome: "Dr. Carlos Silva"
    },
    {
      idConsulta: 2,
      idPaciente: 1,
      dataHoraConsulta: new Date(Date.now() + 86400000).toISOString(), // Amanhã
      idStatus: 1,
      especialidade: "Dermatologia",
      medicoNome: "Dra. Maria Santos"
    }
  ];
}