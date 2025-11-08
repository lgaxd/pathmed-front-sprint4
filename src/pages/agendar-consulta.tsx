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
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade[]>([]);
  const [loading, setLoading] = useState(false);
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
    carregarEspecialidades();
  }, []);

  useEffect(() => {
    if (formData.especialidadeId) {
      carregarProfissionais();
      carregarDisponibilidade();
    }
  }, [formData.especialidadeId]);

  const carregarEspecialidades = async () => {
    try {
      const data = await apiService.getEspecialidades();
      setEspecialidades(data);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
      // Dados mock para desenvolvimento
      setEspecialidades([
        { idEspecialidade: 1, descricaoEspecialidade: 'Cardiologia' },
        { idEspecialidade: 2, descricaoEspecialidade: 'Dermatologia' },
        { idEspecialidade: 3, descricaoEspecialidade: 'Pediatria' },
      ]);
    }
  };

  const carregarProfissionais = async () => {
    try {
      const data = await apiService.getProfissionais();
      const filtrados = data.filter((p: any) => 
        p.idEspecialidade === parseInt(formData.especialidadeId)
      );
      setProfissionais(filtrados);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      // Dados mock
      setProfissionais([
        { idProfissional: 1, nomeProfissionalSaude: 'Dr. Carlos Silva' },
        { idProfissional: 2, nomeProfissionalSaude: 'Dra. Maria Santos' },
      ]);
    }
  };

  const carregarDisponibilidade = async () => {
    try {
      const data = await apiService.getDisponibilidade(parseInt(formData.especialidadeId));
      setDisponibilidade(data);
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
      // Dados mock
      setDisponibilidade([
        { 
          data: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
          horarios: ['09:00', '10:00', '11:00', '14:00', '15:00'] 
        },
        { 
          data: new Date(Date.now() + 172800000).toISOString().split('T')[0], 
          horarios: ['08:00', '09:00', '13:00', '14:00'] 
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.idUsuario) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      const consultaData = {
        idPaciente: user.idUsuario,
        idProfissional: parseInt(formData.profissionalId),
        dataHoraConsulta: `${formData.data}T${formData.horario}:00`,
        idStatus: 1 // Status: Agendado
      };

      const response = await apiService.createConsulta(consultaData);
      
      if (response.idConsulta) {
        alert('Consulta agendada com sucesso!');
        navigate('/');
      } else {
        alert('Erro ao agendar consulta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      alert('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset campos dependentes quando a especialidade muda
      ...(field === 'especialidadeId' && { profissionalId: '', data: '', horario: '' })
    }));
  };

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
              Especialidade
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
          {formData.especialidadeId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional
              </label>
              <select
                value={formData.profissionalId}
                onChange={(e) => handleChange('profissionalId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map(prof => (
                  <option key={prof.idProfissional} value={prof.idProfissional}>
                    {prof.nomeProfissionalSaude}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data */}
          {formData.especialidadeId && disponibilidade.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
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
                    {new Date(disp.data).toLocaleDateString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Horário */}
          {formData.data && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário
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

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.horario}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}