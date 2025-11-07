// src/components/render-agendamentos.tsx
import { ListaAgendamentos } from "./lista-agendamentos";
import type { Agendamento } from "../types/agendamento";
import { useApiService } from "../hooks/usar-api-service";
import { useState, useEffect } from "react";

export function RenderAgendamentos() {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = useApiService();

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        setLoading(true);
        const consultasData = await apiService.getConsultas();
        setConsultas(consultasData);
      } catch (err) {
        setError('Erro ao carregar consultas');
        console.error('Error fetching consultations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [apiService]);

  if (loading) {
    return <div className="text-center py-4">Carregando consultas...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  // Transformar dados da API para o formato do componente
  const agendamentosHoje: Agendamento[] = consultas
    .filter(consulta => {
      const consultaDate = new Date(consulta.dataHoraConsulta);
      const hoje = new Date();
      return consultaDate.toDateString() === hoje.toDateString();
    })
    .map(consulta => ({
      id: consulta.idConsulta.toString(),
      rghcPaciente: "123456", // Você precisará obter isso da API de pacientes
      especialidade: "Consulta", // Obter da API de especialidades
      data: consulta.dataHoraConsulta.split('T')[0],
      horario: consulta.dataHoraConsulta.split('T')[1].substring(0, 5),
      status: getStatusText(consulta.idStatus),
      medicoNome: "Dr. Médico" // Obter da API de profissionais
    }));

  const agendamentosFuturos: Agendamento[] = consultas
    .filter(consulta => {
      const consultaDate = new Date(consulta.dataHoraConsulta);
      const hoje = new Date();
      return consultaDate > hoje && consultaDate.toDateString() !== hoje.toDateString();
    })
    .map(consulta => ({
      id: consulta.idConsulta.toString(),
      rghcPaciente: "123456",
      especialidade: "Consulta",
      data: consulta.dataHoraConsulta.split('T')[0],
      horario: consulta.dataHoraConsulta.split('T')[1].substring(0, 5),
      status: getStatusText(consulta.idStatus),
      medicoNome: "Dr. Médico"
    }));

  return (
    <div className="p-6">
      <ListaAgendamentos 
        agendamentos={agendamentosHoje} 
        titulo="Hoje" 
      />
      
      <ListaAgendamentos 
        agendamentos={agendamentosFuturos} 
        titulo="Próximos dias" 
      />
    </div>
  );
}

function getStatusText(statusId: number): "Agendado" | "Cancelado" | "Concluído" {
  switch (statusId) {
    case 1: return "Agendado";
    case 4: return "Concluído";
    case 5: return "Cancelado";
    default: return "Agendado";
  }
}