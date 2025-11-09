import { useState, useEffect } from 'react';
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useAuth } from "../hooks/usar-auth";
import { useApiService } from '../hooks/usar-api-service';
import { Loading } from '../components/loading';
import fotoUsuario from "../assets/imgs/onboarding/paciente-passo-3.png";

interface Paciente {
  idPaciente: number;
  identificadorRghc: string;
  cpfPaciente: string;
  nomePaciente: string;
  dataNascimento: string;
  tipoSanguineo: string;
  email?: string;
  telefone?: string;
}

export function Perfil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const apiService = useApiService();

  useEffect(() => {
    if (user?.idUsuario) {
      carregarDadosPaciente();
    } else {
      setLoading(false);
      setError('Usuário não identificado. Faça login novamente.');
    }
  }, [user]);

  const carregarDadosPaciente = async () => {
    try {
      setLoading(true);
      setError(null);

      // Se o usuário for paciente, buscar dados completos
      if (user?.tipoUsuario === 'PACIENTE') {
        // Buscar paciente pelo ID do usuário
        const pacienteData = await apiService.getPacienteById(user.idUsuario!);
        setPaciente(pacienteData);
      } else {
        // Se for colaborador ou não tiver dados específicos, usar dados básicos do user
        setPaciente({
          idPaciente: user?.idUsuario || 0,
          identificadorRghc: user?.nomeUsuario || 'Não informado',
          cpfPaciente: '***.***.***-**',
          nomePaciente: user?.nomeUsuario || 'Usuário',
          dataNascimento: 'Não informado',
          tipoSanguineo: 'Não informado',
          email: 'email@exemplo.com',
          telefone: '(11) 99999-9999'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
      setError('Erro ao carregar dados do perfil. Tente novamente.');
      
      // Dados mock como fallback
      setPaciente(getDadosMockPaciente(user));
    } finally {
      setLoading(false);
    }
  };

  const formatarCPF = (cpf: string) => {
    if (cpf.length === 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const formatarData = (data: string) => {
    if (data === 'Não informado') return data;
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    if (dataNascimento === 'Não informado') return 'Não informada';
    
    try {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      
      return `${idade} anos`;
    } catch {
      return 'Data inválida';
    }
  };

  const formatarTelefone = (telefone: string) => {
    if (!telefone) return 'Não informado';
    
    // Remover caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 flex justify-center">
          <Loading message="Carregando perfil..." />
        </main>
      </div>
    );
  }

  if (error && !paciente) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar perfil</h2>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
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
        <div className="max-w-2xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
          )}

          {/* Card do Perfil */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <img
                src={fotoUsuario}
                alt={paciente?.nomePaciente || 'Usuário'}
                className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-blue-100"
              />
              <h2 className="text-2xl font-semibold text-gray-800 text-center">
                {paciente?.nomePaciente || 'Usuário'}
              </h2>
              <p className="text-gray-600 text-center mt-1">
                {user?.tipoUsuario === 'PACIENTE' ? 'Paciente' : 'Colaborador'} • HC
              </p>
            </div>

            <div className="space-y-4">
              {/* Informações Pessoais */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-700">RGHC</span>
                    <span className="text-gray-900">{paciente?.identificadorRghc || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">CPF</span>
                    <span className="text-gray-900">{formatarCPF(paciente?.cpfPaciente || '')}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Data de Nascimento</span>
                    <span className="text-gray-900">{formatarData(paciente?.dataNascimento || '')}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-700">Idade</span>
                    <span className="text-gray-900">{calcularIdade(paciente?.dataNascimento || '')}</span>
                  </div>
                </div>
              </div>

              {/* Informações Médicas */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Informações Médicas</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Tipo Sanguíneo</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    paciente?.tipoSanguineo?.includes('+') 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : paciente?.tipoSanguineo?.includes('-')
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {paciente?.tipoSanguineo || 'Não informado'}
                  </span>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Informações de Contato</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <span className="text-gray-900">{paciente?.email || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Telefone</span>
                    <span className="text-gray-900">{formatarTelefone(paciente?.telefone || '')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                  Editar Perfil
                </button>
                <button className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                  Alterar Senha
                </button>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Sobre suas informações</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Suas informações são mantidas seguras e confidenciais</li>
              <li>• Para atualizar dados pessoais, entre em contato com a administração</li>
              <li>• Em caso de emergência, suas informações médicas são acessíveis à equipe</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

// Função para gerar dados mock do paciente baseado no usuário logado
function getDadosMockPaciente(user: any): Paciente {
  const nomesMock = ['Ana Silva', 'João Oliveira', 'Maria Santos', 'Pedro Souza'];
  const nome = user?.nomeUsuario || nomesMock[Math.floor(Math.random() * nomesMock.length)];
  
  return {
    idPaciente: user?.idUsuario || Math.floor(Math.random() * 1000) + 1,
    identificadorRghc: `RGHC${String(user?.idUsuario || '00000').padStart(5, '0')}`,
    cpfPaciente: '11122233344',
    nomePaciente: nome,
    dataNascimento: '1985-03-15',
    tipoSanguineo: 'A+',
    email: `${nome.toLowerCase().replace(' ', '.')}@email.com`,
    telefone: '(11) 99999-9999'
  };
}