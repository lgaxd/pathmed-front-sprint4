import { useState, useEffect } from 'react';
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useApiService } from '../hooks/usar-api-service';
import { Loading } from '../components/loading';
import { useNavigate } from 'react-router-dom';

interface Paciente {
  idPaciente: number;
  identificadorRghc: string;
  nomePaciente: string;
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

interface Disponibilidade {
  data: string;
  horarios: string[];
}

export function NovoAgendamento() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade[]>([]);
  const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    pacienteId: '',
    especialidadeId: '',
    profissionalId: '',
    data: '',
    horario: ''
  });

  const apiService = useApiService();
  const navigate = useNavigate();

  // Função para normalizar paciente
  const normalizarPaciente = (paciente: any): Paciente => {
    return {
      idPaciente: paciente.id_paciente || paciente.idPaciente,
      identificadorRghc: paciente.identificador_rghc || paciente.identificadorRghc,
      nomePaciente: paciente.nome_paciente || paciente.nomePaciente
    };
  };

  // Função para normalizar profissional
  const normalizarProfissional = (profissional: any): Profissional => {
    return {
      idProfissional: profissional.id_profissional || profissional.idProfissional,
      nomeProfissionalSaude: profissional.nome_profissional_saude || profissional.nomeProfissionalSaude,
      idEspecialidade: profissional.id_especialidade || profissional.idEspecialidade
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
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (formData.especialidadeId) {
      filtrarProfissionais();
      carregarDisponibilidade();
    } else {
      setProfissionaisFiltrados([]);
      setDisponibilidade([]);
      setFormData(prev => ({ ...prev, profissionalId: '', data: '', horario: '' }));
    }
  }, [formData.especialidadeId]);

  useEffect(() => {
    if (formData.profissionalId) {
      carregarDisponibilidade();
    }
  }, [formData.profissionalId]);

  useEffect(() => {
    if (formData.data) {
      setFormData(prev => ({ ...prev, horario: '' }));
    }
  }, [formData.data]);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pacientesData, profissionaisData, especialidadesData] = await Promise.all([
        apiService.getPacientes(),
        apiService.getProfissionais(),
        apiService.getEspecialidades()
      ]);
      
      // Normalizar dados
      const pacientesNormalizados = Array.isArray(pacientesData) 
        ? pacientesData.map(normalizarPaciente)
        : [normalizarPaciente(pacientesData)];

      const profissionaisNormalizados = Array.isArray(profissionaisData)
        ? profissionaisData.map(normalizarProfissional)
        : [normalizarProfissional(profissionaisData)];

      const especialidadesNormalizadas = Array.isArray(especialidadesData)
        ? especialidadesData.map(normalizarEspecialidade)
        : [normalizarEspecialidade(especialidadesData)];
      
      setPacientes(pacientesNormalizados);
      setProfissionais(profissionaisNormalizados);
      setEspecialidades(especialidadesNormalizadas);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      setError('Erro ao carregar dados. Tente novamente.');
      
      // Dados mock para desenvolvimento
      setPacientes(getMockPacientes());
      setProfissionais(getMockProfissionais());
      setEspecialidades(getMockEspecialidades());
    } finally {
      setLoading(false);
    }
  };

  const filtrarProfissionais = () => {
    const filtrados = profissionais.filter(
      prof => prof.idEspecialidade === parseInt(formData.especialidadeId)
    );
    setProfissionaisFiltrados(filtrados);
  };

  const carregarDisponibilidade = async () => {
    try {
      if (!formData.especialidadeId) return;

      const especialidadeId = parseInt(formData.especialidadeId);
      const data = await apiService.getDisponibilidade(especialidadeId);
      
      if (Array.isArray(data) && data.length > 0) {
        setDisponibilidade(data);
      } else {
        // Dados mock caso a API não retorne dados
        const datasDisponiveis = gerarDatasDisponiveis();
        setDisponibilidade(datasDisponiveis);
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
      // Dados mock para desenvolvimento
      const datasDisponiveis = gerarDatasDisponiveis();
      setDisponibilidade(datasDisponiveis);
    }
  };

  const gerarDatasDisponiveis = (): Disponibilidade[] => {
    const datas = [];
    const hoje = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      
      if (data.getDay() !== 0 && data.getDay() !== 6) { // Não incluir fins de semana
        datas.push({
          data: data.toISOString().split('T')[0],
          horarios: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
        });
      }
    }
    
    return datas;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset campos dependentes
      if (field === 'pacienteId') {
        // Nenhum reset necessário
      } else if (field === 'especialidadeId') {
        newData.profissionalId = '';
        newData.data = '';
        newData.horario = '';
      } else if (field === 'profissionalId') {
        newData.data = '';
        newData.horario = '';
      } else if (field === 'data') {
        newData.horario = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pacienteId || !formData.profissionalId || !formData.data || !formData.horario) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSalvando(true);
    setError(null);
    setSucesso(null);

    try {
      const consultaData = {
        idPaciente: parseInt(formData.pacienteId),
        idProfissional: parseInt(formData.profissionalId),
        dataHoraConsulta: `${formData.data}T${formData.horario}:00`
      };

      await apiService.createConsulta(consultaData);
      
      setSucesso('Agendamento criado com sucesso!');
      
      // Limpar formulário
      setFormData({
        pacienteId: '',
        especialidadeId: '',
        profissionalId: '',
        data: '',
        horario: ''
      });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/agendamentos');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      setError('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    navigate('/colaborador');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 max-w-4xl mx-auto">
          <Loading message="Carregando dados..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Novo Agendamento</h1>
          <p className="text-gray-600">Crie um novo agendamento de consulta para um paciente</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {sucesso && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600 text-sm">{sucesso}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paciente *
            </label>
            <select
              value={formData.pacienteId}
              onChange={(e) => handleChange('pacienteId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um paciente</option>
              {pacientes.map(paciente => (
                <option 
                  key={paciente.idPaciente} // ✅ ADICIONADO KEY ÚNICA
                  value={paciente.idPaciente}
                >
                  {paciente.nomePaciente} ({paciente.identificadorRghc})
                </option>
              ))}
            </select>
          </div>

          {/* Especialidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidade *
            </label>
            <select
              value={formData.especialidadeId}
              onChange={(e) => handleChange('especialidadeId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma especialidade</option>
              {especialidades.map(esp => (
                <option 
                  key={esp.idEspecialidade} // ✅ ADICIONADO KEY ÚNICA
                  value={esp.idEspecialidade}
                >
                  {esp.descricaoEspecialidade}
                </option>
              ))}
            </select>
          </div>

          {/* Profissional */}
          {formData.especialidadeId && profissionaisFiltrados.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional *
              </label>
              <select
                value={formData.profissionalId}
                onChange={(e) => handleChange('profissionalId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um profissional</option>
                {profissionaisFiltrados.map(prof => (
                  <option 
                    key={prof.idProfissional} // ✅ ADICIONADO KEY ÚNICA
                    value={prof.idProfissional}
                  >
                    {prof.nomeProfissionalSaude}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.especialidadeId && profissionaisFiltrados.length === 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Nenhum profissional disponível para esta especialidade no momento.
              </p>
            </div>
          )}

          {/* Data */}
          {formData.profissionalId && disponibilidade.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data *
              </label>
              <select
                value={formData.data}
                onChange={(e) => handleChange('data', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione uma data</option>
                {disponibilidade.map(disp => (
                  <option 
                    key={disp.data} // ✅ ADICIONADO KEY ÚNICA
                    value={disp.data}
                  >
                    {new Date(disp.data).toLocaleDateString('pt-BR', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.profissionalId && disponibilidade.length === 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Nenhuma data disponível para este profissional no momento.
              </p>
            </div>
          )}

          {/* Horário */}
          {formData.data && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário *
              </label>
              <select
                value={formData.horario}
                onChange={(e) => handleChange('horario', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um horário</option>
                {disponibilidade
                  .find(disp => disp.data === formData.data)
                  ?.horarios.map(horario => (
                    <option 
                      key={horario} // ✅ ADICIONADO KEY ÚNICA
                      value={horario}
                    >
                      {horario}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Resumo do Agendamento */}
          {formData.horario && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Resumo do Agendamento</h3>
              <div className="text-blue-700 space-y-1">
                <p><strong>Paciente:</strong> {pacientes.find(p => p.idPaciente === parseInt(formData.pacienteId))?.nomePaciente}</p>
                <p><strong>Especialidade:</strong> {especialidades.find(e => e.idEspecialidade === parseInt(formData.especialidadeId))?.descricaoEspecialidade}</p>
                <p><strong>Profissional:</strong> {profissionaisFiltrados.find(p => p.idProfissional === parseInt(formData.profissionalId))?.nomeProfissionalSaude}</p>
                <p><strong>Data:</strong> {new Date(formData.data).toLocaleDateString('pt-BR')}</p>
                <p><strong>Horário:</strong> {formData.horario}</p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancelar}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || !formData.horario}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {salvando ? 'Criando Agendamento...' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Dados mock para desenvolvimento
function getMockPacientes(): Paciente[] {
  return [
    { idPaciente: 1, identificadorRghc: "RGHC00123", nomePaciente: "Ana Silva" },
    { idPaciente: 2, identificadorRghc: "RGHC00456", nomePaciente: "João Oliveira" },
    { idPaciente: 3, identificadorRghc: "RGHC00789", nomePaciente: "Maria Santos" },
  ];
}

function getMockProfissionais(): Profissional[] {
  return [
    { idProfissional: 1, nomeProfissionalSaude: "Dr. Carlos Santos", idEspecialidade: 1 },
    { idProfissional: 2, nomeProfissionalSaude: "Dra. Maria Costa", idEspecialidade: 2 },
    { idProfissional: 3, nomeProfissionalSaude: "Dr. Paulo Lima", idEspecialidade: 3 },
  ];
}

function getMockEspecialidades(): Especialidade[] {
  return [
    { idEspecialidade: 1, descricaoEspecialidade: "Cardiologia" },
    { idEspecialidade: 2, descricaoEspecialidade: "Dermatologia" },
    { idEspecialidade: 3, descricaoEspecialidade: "Pediatria" },
  ];
}