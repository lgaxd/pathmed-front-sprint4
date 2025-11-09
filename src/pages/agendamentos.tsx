import { useState, useEffect } from 'react';
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useApiService } from '../hooks/usar-api-service';
import { Loading } from '../components/loading';

interface Consulta {
  idConsulta: number;
  idPaciente: number;
  idProfissional: number;
  idStatus: number;
  dataHoraConsulta: string;
  nomePaciente?: string;
  nomeProfissional?: string;
  especialidade?: string;
}

interface Profissional {
  idProfissional: number;
  nomeProfissionalSaude: string;
}

interface Especialidade {
  idEspecialidade: number;
  descricaoEspecialidade: string;
}

export function Agendamentos() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiService = useApiService();

  const normalizarConsulta = (consulta: any): Consulta => {
    const baseConsulta = {
      idConsulta: consulta.id_consulta || consulta.idConsulta,
      idPaciente: consulta.id_paciente || consulta.idPaciente,
      idProfissional: consulta.id_profissional || consulta.idProfissional,
      idStatus: consulta.id_status || consulta.idStatus,
      dataHoraConsulta: consulta.data_hora_consulta || consulta.dataHoraConsulta
    };

    // Se a API Python já retornar os dados completos, usar eles
    if (consulta.nome_paciente || consulta.nome_profissional_saude || consulta.descricao_especialidade) {
      return {
        ...baseConsulta,
        nomePaciente: consulta.nome_paciente,
        nomeProfissional: consulta.nome_profissional_saude,
        especialidade: consulta.descricao_especialidade
      };
    }

    return baseConsulta;
  };

  // Função para normalizar profissional
  const normalizarProfissional = (profissional: any): Profissional => {
    return {
      idProfissional: profissional.id_profissional || profissional.idProfissional,
      nomeProfissionalSaude: profissional.nome_profissional_saude || profissional.nomeProfissionalSaude
    };
  };

  // Função para normalizar especialidade
  const normalizarEspecialidade = (especialidade: any): Especialidade => {
    return {
      idEspecialidade: especialidade.id_especialidade || especialidade.idEspecialidade,
      descricaoEspecialidade: especialidade.descricao_especialidade || especialidade.descricaoEspecialidade
    };
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const [consultasData, profissionaisData, especialidadesData] = await Promise.all([
        apiService.getConsultas(),
        apiService.getProfissionais(),
        apiService.getEspecialidades()
      ]);

      // Normalizar dados
      const consultasNormalizadas = Array.isArray(consultasData)
        ? consultasData.map(normalizarConsulta)
        : [normalizarConsulta(consultasData)];

      const profissionaisNormalizados = Array.isArray(profissionaisData)
        ? profissionaisData.map(normalizarProfissional)
        : [normalizarProfissional(profissionaisData)];

      const especialidadesNormalizadas = Array.isArray(especialidadesData)
        ? especialidadesData.map(normalizarEspecialidade)
        : [normalizarEspecialidade(especialidadesData)];

      // Enriquecer dados das consultas (se necessário)
      const consultasEnriquecidas = await Promise.all(
        consultasNormalizadas.map(async (consulta: Consulta) => {
          // Se já tiver dados completos da API Python, retornar como está
          if (consulta.nomePaciente && consulta.nomeProfissional && consulta.especialidade) {
            return consulta;
          }

          try {
            // Caso contrário, buscar dados adicionais
            const paciente = await apiService.getPacienteById(consulta.idPaciente);
            const profissional = profissionaisNormalizados.find((p: Profissional) => p.idProfissional === consulta.idProfissional);

            // Para especialidade, precisaríamos de uma lógica adicional para mapear profissional -> especialidade
            const especialidade = "Especialidade a definir"; // Placeholder

            return {
              ...consulta,
              nomePaciente: paciente?.nomePaciente || 'Paciente não encontrado',
              nomeProfissional: profissional?.nomeProfissionalSaude || 'Profissional não encontrado',
              especialidade: especialidade
            };
          } catch (error) {
            console.error(`Erro ao carregar dados da consulta ${consulta.idConsulta}:`, error);
            return {
              ...consulta,
              nomePaciente: 'Erro ao carregar',
              nomeProfissional: 'Erro ao carregar',
              especialidade: 'Erro ao carregar'
            };
          }
        })
      );

      // Ordenar por data mais recente
      consultasEnriquecidas.sort((a, b) =>
        new Date(b.dataHoraConsulta).getTime() - new Date(a.dataHoraConsulta).getTime()
      );

      setConsultas(consultasEnriquecidas);
      setProfissionais(profissionaisNormalizados);
      setEspecialidades(especialidadesNormalizadas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar agendamentos. Tente novamente.');

      // Dados mock para desenvolvimento
      const mockConsultas = getMockConsultas();
      mockConsultas.sort((a, b) =>
        new Date(b.dataHoraConsulta).getTime() - new Date(a.dataHoraConsulta).getTime()
      );
      setConsultas(mockConsultas);
    } finally {
      setLoading(false);
    }
  };


  const atualizarStatusConsulta = async (consultaId: number, novoStatus: number) => {
    try {
      setAtualizando(consultaId);
      setError(null);

      await apiService.updateConsultaStatus(consultaId, novoStatus);

      // Atualizar localmente
      setConsultas(prev => prev.map(consulta =>
        consulta.idConsulta === consultaId
          ? { ...consulta, idStatus: novoStatus }
          : consulta
      ));

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status da consulta.');
    } finally {
      setAtualizando(null);
    }
  };

  const getStatusText = (statusId: number): string => {
    const statusMap: { [key: number]: string } = {
      1: 'Agendado',
      2: 'Confirmado',
      3: 'Em Andamento',
      4: 'Concluído',
      5: 'Cancelado',
      6: 'Não Compareceu'
    };
    return statusMap[statusId] || 'Desconhecido';
  };

  const getStatusColor = (statusId: number): string => {
    const colorMap: { [key: number]: string } = {
      1: 'bg-blue-100 text-blue-800 border border-blue-200',
      2: 'bg-green-100 text-green-800 border border-green-200',
      3: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      4: 'bg-purple-100 text-purple-800 border border-purple-200',
      5: 'bg-red-100 text-red-800 border border-red-200',
      6: 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return colorMap[statusId] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatarDataHora = (dataHora: string): string => {
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAcoesDisponiveis = (statusId: number) => {
    const acoes = [];

    if (statusId === 1) {
      acoes.push({ label: 'Confirmar', status: 2, cor: 'green' });
      acoes.push({ label: 'Cancelar', status: 5, cor: 'red' });
    } else if (statusId === 2) {
      acoes.push({ label: 'Iniciar', status: 3, cor: 'yellow' });
      acoes.push({ label: 'Cancelar', status: 5, cor: 'red' });
    } else if (statusId === 3) {
      acoes.push({ label: 'Concluir', status: 4, cor: 'purple' });
      acoes.push({ label: 'Não Compareceu', status: 6, cor: 'gray' });
    } else if (statusId === 4 || statusId === 5 || statusId === 6) {
      acoes.push({ label: 'Reagendar', status: 1, cor: 'blue' });
    }

    return acoes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          <Loading message="Carregando agendamentos..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciar Agendamentos</h1>
          <p className="text-gray-600">Visualize e atualize o status das consultas</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultas.map((consulta) => {
                  const acoesDisponiveis = getAcoesDisponiveis(consulta.idStatus);

                  return (
                    <tr key={consulta.idConsulta} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {consulta.nomePaciente}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {consulta.nomeProfissional}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {consulta.especialidade}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatarDataHora(consulta.dataHoraConsulta)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(consulta.idStatus)}`}>
                          {getStatusText(consulta.idStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {acoesDisponiveis.map((acao) => (
                            <button
                              key={acao.status}
                              onClick={() => atualizarStatusConsulta(consulta.idConsulta, acao.status)}
                              disabled={atualizando === consulta.idConsulta}
                              className={`bg-${acao.cor}-500 text-white px-3 py-1 rounded text-xs hover:bg-${acao.cor}-600 disabled:opacity-50 cursor-pointer transition-colors`}
                            >
                              {atualizando === consulta.idConsulta ? '...' : acao.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {consultas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento encontrado.</p>
            </div>
          )}
        </div>

        {/* Legenda de Status */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Legenda de Status:</h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
              Agendado
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
              Confirmado
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
              Em Andamento
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 border border-purple-200">
              Concluído
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 border border-red-200">
              Cancelado
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-200">
              Não Compareceu
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

// Dados mock para desenvolvimento
function getMockConsultas(): Consulta[] {
  return [
    {
      idConsulta: 1,
      idPaciente: 1,
      idProfissional: 1,
      idStatus: 1,
      dataHoraConsulta: new Date(Date.now() + 86400000).toISOString(),
      nomePaciente: 'Ana Silva',
      nomeProfissional: 'Dr. Carlos Santos',
      especialidade: 'Cardiologia'
    },
    {
      idConsulta: 2,
      idPaciente: 2,
      idProfissional: 2,
      idStatus: 2,
      dataHoraConsulta: new Date(Date.now() + 172800000).toISOString(),
      nomePaciente: 'João Oliveira',
      nomeProfissional: 'Dra. Maria Costa',
      especialidade: 'Dermatologia'
    },
    {
      idConsulta: 3,
      idPaciente: 3,
      idProfissional: 3,
      idStatus: 4,
      dataHoraConsulta: new Date(Date.now() - 86400000).toISOString(),
      nomePaciente: 'Pedro Souza',
      nomeProfissional: 'Dr. Paulo Lima',
      especialidade: 'Pediatria'
    }
  ];
}