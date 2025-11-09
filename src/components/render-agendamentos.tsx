import { ListaAgendamentos } from "./lista-agendamentos";
import type { Agendamento } from "../types/agendamento";
import { useApiService } from "../hooks/usar-api-service";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/usar-auth";

export function RenderAgendamentos() {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([]);
  const [agendamentosFuturos, setAgendamentosFuturos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = useApiService();
  const { user } = useAuth();

  // Buscar dados adicionais uma única vez
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<any[]>([]);

  useEffect(() => {
    const fetchDadosAdicionais = async () => {
      try {
        const [profissionaisData, especialidadesData] = await Promise.all([
          apiService.getProfissionais(),
          apiService.getEspecialidades()
        ]);
        setProfissionais(Array.isArray(profissionaisData) ? profissionaisData : []);
        setEspecialidades(Array.isArray(especialidadesData) ? especialidadesData : []);
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    fetchDadosAdicionais();
  }, [apiService]);

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obter o ID do usuário logado do localStorage ou do contexto de auth
        const userToken = localStorage.getItem('userToken');
        let userId: number | null = null;

        if (userToken) {
          try {
            const userData = JSON.parse(userToken);
            userId = userData.idUsuario || user?.idUsuario;
          } catch (e) {
            console.error('Error parsing user token:', e);
          }
        }

        console.log('Buscando consultas para o usuário:', userId);

        if (userId) {
          // Buscar consultas específicas do paciente logado
          const consultasData = await apiService.getConsultasPorPaciente(userId);
          console.log('Consultas do paciente:', consultasData);
          setConsultas(Array.isArray(consultasData) ? consultasData : [consultasData]);
        } else {
          // Se não encontrar userId, não buscar consultas
          console.warn('ID do usuário não encontrado. Não será possível carregar consultas.');
          setConsultas([]);
          setError('Usuário não identificado. Faça login novamente.');
        }
      } catch (err) {
        console.error('Error fetching consultations:', err);
        setConsultas([]);
        setError('Erro ao carregar consultas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [apiService, user]); // Recarregar quando o usuário mudar

  // Processar agendamentos quando os dados estiverem disponíveis
  useEffect(() => {
    if (consultas.length > 0 && profissionais.length > 0 && especialidades.length > 0) {
      processarAgendamentos();
    } else if (consultas.length === 0 && !loading) {
      // Se não há consultas e não está carregando, limpar os agendamentos
      setAgendamentosHoje([]);
      setAgendamentosFuturos([]);
    }
  }, [consultas, profissionais, especialidades, loading]);

  const processarAgendamentos = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const hojeAgendamentos: Agendamento[] = [];
    const futurosAgendamentos: Agendamento[] = [];

    consultas.forEach(consulta => {
      const profissional = profissionais.find(p => p.idProfissional === consulta.idProfissional);
      const especialidade = especialidades.find(e => e.idEspecialidade === profissional?.idEspecialidade);

      const dataHora = new Date(consulta.dataHoraConsulta);
      const dataISO = dataHora.toISOString().split('T')[0];
      const horario = dataHora.toTimeString().split(' ')[0].substring(0, 5);

      const agendamento: Agendamento = {
        id: consulta.idConsulta.toString(),
        rghcPaciente: consulta.idPaciente.toString(),
        especialidade: especialidade?.descricaoEspecialidade || "Especialidade não definida",
        data: dataISO,
        horario: horario,
        status: getStatusText(consulta.idStatus),
        medicoNome: profissional?.nomeProfissionalSaude || "Médico não especificado"
      };

      const dataAgendamento = new Date(dataISO);
      dataAgendamento.setHours(0, 0, 0, 0);

      if (dataAgendamento.getTime() === hoje.getTime()) {
        hojeAgendamentos.push(agendamento);
      } else if (dataAgendamento.getTime() > hoje.getTime()) {
        futurosAgendamentos.push(agendamento);
      }
    });

    setAgendamentosHoje(hojeAgendamentos);
    setAgendamentosFuturos(futurosAgendamentos);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Carregando consultas...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {consultas.length === 0 && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Nenhuma consulta agendada</h3>
          <p className="text-blue-600">Você ainda não possui consultas agendadas.</p>
          <button
            onClick={() => window.location.href = '/agendar-consulta'}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow cursor-pointer transition-colors duration-200"
          >
            Agendar Primeira Consulta
          </button>
        </div>
      )}
      
      {agendamentosHoje.length > 0 && (
        <ListaAgendamentos 
          agendamentos={agendamentosHoje} 
          titulo="Hoje" 
        />
      )}
      
      {agendamentosFuturos.length > 0 && (
        <ListaAgendamentos 
          agendamentos={agendamentosFuturos} 
          titulo="Próximos Dias" 
        />
      )}

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

function getStatusText(statusId: number): "Agendado" | "Cancelado" | "Concluído" {
  switch (statusId) {
    case 1: return "Agendado";
    case 4: return "Concluído";
    case 5: return "Cancelado";
    default: return "Agendado";
  }
}

// Dados mock para desenvolvimento (apenas para fallback)
function getMockConsultas() {
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  return [
    {
      idConsulta: 1,
      idPaciente: 1,
      idProfissional: 1,
      idStatus: 1,
      dataHoraConsulta: hoje.toISOString()
    },
    {
      idConsulta: 2,
      idPaciente: 1,
      idProfissional: 2,
      idStatus: 1,
      dataHoraConsulta: amanha.toISOString()
    }
  ];
}