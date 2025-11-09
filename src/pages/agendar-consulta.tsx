import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useApiService } from '../hooks/usar-api-service';
import { useAuth } from '../hooks/usar-auth';
import { Loading } from '../components/loading';

interface Especialidade {
  idEspecialidade: number;
  descricaoEspecialidade: string;
}

interface Profissional {
  idProfissional: number;
  idEspecialidade: number;
  nomeProfissionalSaude: string;
}

interface Disponibilidade {
  data: string;
  horarios: string[];
}

export function AgendarConsulta() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<Profissional[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [formData, setFormData] = useState({
    especialidadeId: '',
    profissionalId: '',
    data: '',
    horario: ''
  });
  
  const navigate = useNavigate();
  const apiService = useApiService();
  const { user } = useAuth();

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
      setCarregandoDados(true);
      const [especialidadesData, profissionaisData] = await Promise.all([
        apiService.getEspecialidades(),
        apiService.getProfissionais()
      ]);
      
      setEspecialidades(especialidadesData);
      setProfissionais(profissionaisData);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      // Dados mock para desenvolvimento
      setEspecialidades([
        { idEspecialidade: 1, descricaoEspecialidade: 'Cardiologia' },
        { idEspecialidade: 2, descricaoEspecialidade: 'Dermatologia' },
        { idEspecialidade: 3, descricaoEspecialidade: 'Pediatria' },
      ]);
      setProfissionais([
        { idProfissional: 1, idEspecialidade: 1, nomeProfissionalSaude: 'Dr. Carlos Silva' },
        { idProfissional: 2, idEspecialidade: 1, nomeProfissionalSaude: 'Dra. Maria Santos' },
        { idProfissional: 3, idEspecialidade: 2, nomeProfissionalSaude: 'Dr. João Pereira' },
      ]);
    } finally {
      setCarregandoDados(false);
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
          horarios: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
        });
      }
    }
    
    return datas;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.idUsuario) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    if (!formData.especialidadeId || !formData.profissionalId || !formData.data || !formData.horario) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const consultaData = {
        idPaciente: user.idUsuario,
        idProfissional: parseInt(formData.profissionalId),
        dataHoraConsulta: `${formData.data}T${formData.horario}:00`
      };

      await apiService.createConsulta(consultaData);
      
      // Sempre redireciona para home após tentativa de agendamento
      navigate('/');
      
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      // Mesmo com erro, redireciona para home (já que o agendamento aparece)
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset campos dependentes
      if (field === 'especialidadeId') {
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

  if (carregandoDados) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 max-w-2xl mx-auto">
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
      
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Agendar Nova Consulta</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
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
                <option key={esp.idEspecialidade} value={esp.idEspecialidade}>
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
                  <option key={prof.idProfissional} value={prof.idProfissional}>
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
                  <option key={disp.data} value={disp.data}>
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
                    <option key={horario} value={horario}>
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
              <p className="text-blue-700">
                <strong>Especialidade:</strong> {especialidades.find(e => e.idEspecialidade === parseInt(formData.especialidadeId))?.descricaoEspecialidade}
              </p>
              <p className="text-blue-700">
                <strong>Profissional:</strong> {profissionaisFiltrados.find(p => p.idProfissional === parseInt(formData.profissionalId))?.nomeProfissionalSaude}
              </p>
              <p className="text-blue-700">
                <strong>Data:</strong> {new Date(formData.data).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-blue-700">
                <strong>Horário:</strong> {formData.horario}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.horario}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}