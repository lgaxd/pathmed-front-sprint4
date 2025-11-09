import { useState, useEffect } from 'react';
import { useApiService } from '../hooks/usar-api-service';
import { useAuth } from '../hooks/usar-auth';
import { Loading } from './loading';

interface Consulta {
  id_consulta: number;
  id_paciente: number;
  id_profissional: number;
  id_status: number;
  data_hora_consulta: string;
  nome_paciente?: string;
  nome_profissional_saude?: string;
  descricao_especialidade?: string;
  descricao_status?: string;
}

interface Profissional {
  idProfissional: number;
  nomeProfissionalSaude: string;
  idEspecialidade: number;
}

interface Especialidade {
  idEspecialidade: number;
  descricaoEspecialidade: string;
}

export function RenderConsultas() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dadosAdicionaisCarregados, setDadosAdicionaisCarregados] = useState(false);
  const apiService = useApiService();
  const { user } = useAuth();

  // Buscar dados adicionais (profissionais e especialidades)
  useEffect(() => {
    const fetchDadosAdicionais = async () => {
      try {
        console.log('🔄 Buscando dados adicionais...');
        const [profissionaisData, especialidadesData] = await Promise.all([
          apiService.getProfissionais(),
          apiService.getEspecialidades()
        ]);
        
        console.log('📊 Profissionais recebidos:', profissionaisData);
        console.log('📊 Especialidades recebidas:', especialidadesData);
        
        // Normalizar dados
        const profissionaisNormalizados = Array.isArray(profissionaisData) 
          ? profissionaisData.map(normalizarProfissional)
          : [normalizarProfissional(profissionaisData)];

        const especialidadesNormalizadas = Array.isArray(especialidadesData)
          ? especialidadesData.map(normalizarEspecialidade)
          : [normalizarEspecialidade(especialidadesData)];

        setProfissionais(profissionaisNormalizados);
        setEspecialidades(especialidadesNormalizadas);
        setDadosAdicionaisCarregados(true);
        console.log('✅ Dados adicionais carregados');
        
      } catch (error) {
        console.error('❌ Error fetching additional data:', error);
        setDadosAdicionaisCarregados(true); // Marcar como carregado mesmo com erro
      }
    };

    fetchDadosAdicionais();
  }, [apiService]);

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obter o ID do usuário logado
        const userToken = localStorage.getItem('userToken');
        let pacienteId: number | null = null;

        if (userToken) {
          try {
            const userData = JSON.parse(userToken);
            pacienteId = userData.idUsuario || user?.idUsuario;
          } catch (e) {
            console.error('Error parsing user token:', e);
          }
        }

        console.log('🔄 Buscando consultas para o paciente:', pacienteId);

        if (pacienteId) {
          // Buscar consultas específicas do paciente logado
          const consultasData = await apiService.getConsultasPorPaciente(pacienteId);
          console.log('📋 Consultas do paciente:', consultasData);
          
          // Normalizar os dados para lidar com Java e Python
          const consultasNormalizadas = Array.isArray(consultasData) 
            ? consultasData.map(normalizarConsulta)
            : [normalizarConsulta(consultasData)];
          
          console.log('📋 Consultas normalizadas:', consultasNormalizadas);
          
          setConsultas(consultasNormalizadas);
        } else {
          console.warn('ID do paciente não encontrado.');
          setError('Usuário não identificado. Faça login novamente.');
        }
      } catch (err) {
        console.error('❌ Error fetching consultations:', err);
        setError('Erro ao carregar consultas. Tente novamente mais tarde.');
        setConsultas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [apiService, user]);

  // Enriquecer consultas quando ambos os dados estiverem disponíveis
  useEffect(() => {
    if (consultas.length > 0 && dadosAdicionaisCarregados) {
      console.log('🎯 Enriquecendo consultas com dados adicionais...');
      const consultasEnriquecidas = enriquecerConsultas(consultas);
      console.log('✅ Consultas enriquecidas:', consultasEnriquecidas);
      
      // Ordenar por data (mais recente primeiro)
      consultasEnriquecidas.sort((a, b) => 
        new Date(b.data_hora_consulta).getTime() - new Date(a.data_hora_consulta).getTime()
      );
      
      setConsultas(consultasEnriquecidas);
    }
  }, [consultas, dadosAdicionaisCarregados, profissionais, especialidades]);

  // Função para enriquecer consultas com dados adicionais (para API Java)
  const enriquecerConsultas = (consultas: Consulta[]): Consulta[] => {
    console.log('🔍 Verificando se precisa enriquecer consultas...');
    
    // Verificar se já temos dados completos (API Python)
    const temDadosCompletos = consultas.some(consulta => 
      consulta.nome_profissional_saude && consulta.descricao_especialidade
    );
    
    if (temDadosCompletos) {
      console.log('✅ API Python - Dados já completos');
      return consultas;
    }

    console.log('🔄 API Java - Enriquecendo dados...');
    console.log('📊 Profissionais disponíveis:', profissionais.length);
    console.log('📊 Especialidades disponíveis:', especialidades.length);

    // Para API Java, buscar dados adicionais
    return consultas.map(consulta => {
      console.log(`🔍 Buscando dados para consulta ${consulta.id_consulta}, profissional ${consulta.id_profissional}`);
      
      const profissional = profissionais.find(p => 
        p.idProfissional === consulta.id_profissional
      );
      
      console.log('👨‍⚕️ Profissional encontrado:', profissional);
      
      let especialidadeNome = 'Especialidade não definida';
      if (profissional) {
        const especialidade = especialidades.find(e => 
          e.idEspecialidade === profissional.idEspecialidade
        );
        especialidadeNome = especialidade?.descricaoEspecialidade || 'Especialidade não definida';
        console.log('🎯 Especialidade encontrada:', especialidadeNome);
      }

      return {
        ...consulta,
        nome_profissional_saude: profissional?.nomeProfissionalSaude || 'Profissional não encontrado',
        descricao_especialidade: especialidadeNome
      };
    });
  };

  // Função para normalizar consulta (suporte Java e Python)
  const normalizarConsulta = (consulta: any): Consulta => {
    return {
      id_consulta: consulta.id_consulta || consulta.idConsulta,
      id_paciente: consulta.id_paciente || consulta.idPaciente,
      id_profissional: consulta.id_profissional || consulta.idProfissional,
      id_status: consulta.id_status || consulta.idStatus,
      data_hora_consulta: consulta.data_hora_consulta || consulta.dataHoraConsulta,
      nome_paciente: consulta.nome_paciente || consulta.nomePaciente,
      nome_profissional_saude: consulta.nome_profissional_saude || consulta.nomeProfissionalSaude,
      descricao_especialidade: consulta.descricao_especialidade || consulta.descricaoEspecialidade,
      descricao_status: consulta.descricao_status || consulta.descricaoStatus
    };
  };

  // Função para normalizar profissional
  const normalizarProfissional = (profissional: any): Profissional => {
    const profNormalizado = {
      idProfissional: profissional.id_profissional || profissional.idProfissional,
      nomeProfissionalSaude: profissional.nome_profissional_saude || profissional.nomeProfissionalSaude,
      idEspecialidade: profissional.id_especialidade || profissional.idEspecialidade
    };
    console.log('👨‍⚕️ Profissional normalizado:', profNormalizado);
    return profNormalizado;
  };

  // Função para normalizar especialidade
  const normalizarEspecialidade = (especialidade: any): Especialidade => {
    const espNormalizada = {
      idEspecialidade: especialidade.id_especialidade || especialidade.idEspecialidade,
      descricaoEspecialidade: especialidade.descricao_especialidade || especialidade.descricaoEspecialidade
    };
    console.log('🎯 Especialidade normalizada:', espNormalizada);
    return espNormalizada;
  };

  const formatarDataHora = (dataHoraString: string) => {
    try {
      const dataHora = new Date(dataHoraString);
      return dataHora.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', dataHoraString, error);
      return dataHoraString;
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return 'bg-blue-100 text-blue-800'; // Agendado
      case 2: return 'bg-green-100 text-green-800'; // Confirmado
      case 3: return 'bg-yellow-100 text-yellow-800'; // Em Andamento
      case 4: return 'bg-purple-100 text-purple-800'; // Concluído
      case 5: return 'bg-red-100 text-red-800'; // Cancelado
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (statusId: number, descricaoStatus?: string) => {
    if (descricaoStatus) return descricaoStatus;
    
    switch (statusId) {
      case 1: return 'Agendado';
      case 2: return 'Confirmado';
      case 3: return 'Em Andamento';
      case 4: return 'Concluído';
      case 5: return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loading message="Carregando consultas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-2">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {consultas.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Nenhuma consulta encontrada</h3>
          <p className="text-blue-600">Você ainda não possui consultas agendadas.</p>
          <button
            onClick={() => window.location.href = '/agendar-consulta'}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow cursor-pointer transition-colors duration-200"
          >
            Agendar Primeira Consulta
          </button>
        </div>
      ) : (
        consultas.map((consulta) => (
          <div key={consulta.id_consulta} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {consulta.descricao_especialidade || 'Consulta Médica'}
                </h3>
                <p className="text-gray-600">
                  Com {consulta.nome_profissional_saude || 'Profissional não especificado'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consulta.id_status)}`}>
                {getStatusText(consulta.id_status, consulta.descricao_status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-700">Data e Horário:</span>
                <p>{formatarDataHora(consulta.data_hora_consulta)}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Código da Consulta:</span>
                <p>#{consulta.id_consulta}</p>
              </div>
            </div>

            {/* Ações baseadas no status */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {consulta.id_status === 1 && ( // Agendado
                <div className="flex space-x-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-sm">
                    Confirmar Presença
                  </button>
                  <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer text-sm">
                    Remarcar
                  </button>
                </div>
              )}
              
              {consulta.id_status === 2 && ( // Confirmado
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors cursor-pointer text-sm">
                  Acessar Consulta
                </button>
              )}
              
              {consulta.id_status === 4 && ( // Concluído
                <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors cursor-pointer text-sm">
                  Ver Detalhes
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}