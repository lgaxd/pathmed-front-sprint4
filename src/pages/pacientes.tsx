import { useState, useEffect } from 'react';
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useApiService } from '../hooks/usar-api-service';
import { Loading } from '../components/loading';

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

export function Pacientes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [pacienteEdit, setPacienteEdit] = useState<Paciente | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  
  const apiService = useApiService();

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const pacientesData = await apiService.getPacientes();
      // Ordenar por nome
      pacientesData.sort((a: Paciente, b: Paciente) => 
        a.nomePaciente.localeCompare(b.nomePaciente)
      );
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      setError('Erro ao carregar pacientes. Tente novamente.');
      
      // Dados mock para desenvolvimento
      const mockPacientes = getMockPacientes();
      mockPacientes.sort((a, b) => a.nomePaciente.localeCompare(b.nomePaciente));
      setPacientes(mockPacientes);
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (paciente: Paciente) => {
    setEditando(paciente.idPaciente);
    setPacienteEdit({ ...paciente });
    setError(null);
    setSucesso(null);
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setPacienteEdit(null);
    setError(null);
  };

  const salvarEdicao = async () => {
    if (!pacienteEdit) return;

    try {
      setError(null);
      setSucesso(null);

      // Validações básicas
      if (!pacienteEdit.nomePaciente.trim()) {
        setError('Nome do paciente é obrigatório');
        return;
      }

      if (!pacienteEdit.dataNascimento) {
        setError('Data de nascimento é obrigatória');
        return;
      }

      if (!pacienteEdit.tipoSanguineo) {
        setError('Tipo sanguíneo é obrigatório');
        return;
      }

      // Preparar dados para envio conforme especificação
      const dadosAtualizacao = {
        id: pacienteEdit.idPaciente,
        identificadorRghc: pacienteEdit.identificadorRghc,
        cpfPaciente: pacienteEdit.cpfPaciente,
        nomePaciente: pacienteEdit.nomePaciente.trim(),
        dataNascimento: pacienteEdit.dataNascimento,
        tipoSanguineo: pacienteEdit.tipoSanguineo
      };

      await apiService.updatePaciente(pacienteEdit.idPaciente, dadosAtualizacao);
      
      // Atualizar localmente mantendo a ordenação
      setPacientes(prev => {
        const atualizados = prev.map(p => 
          p.idPaciente === pacienteEdit.idPaciente ? pacienteEdit : p
        );
        return atualizados.sort((a, b) => a.nomePaciente.localeCompare(b.nomePaciente));
      });
      
      setSucesso('Paciente atualizado com sucesso!');
      setEditando(null);
      setPacienteEdit(null);
      
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      setError('Erro ao atualizar paciente. Tente novamente.');
    }
  };

  const handleEditChange = (campo: string, valor: string) => {
    if (pacienteEdit) {
      setPacienteEdit({
        ...pacienteEdit,
        [campo]: valor
      });
    }
  };

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const tiposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">
          <Loading message="Carregando pacientes..." />
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciar Pacientes</h1>
          <p className="text-gray-600">Visualize e atualize informações dos pacientes</p>
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RGHC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Nasc.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Sanguíneo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pacientes.map((paciente) => (
                  <tr key={paciente.idPaciente} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {paciente.identificadorRghc}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editando === paciente.idPaciente ? (
                        <input
                          type="text"
                          value={pacienteEdit?.nomePaciente || ''}
                          onChange={(e) => handleEditChange('nomePaciente', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Nome completo"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{paciente.nomePaciente}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatarCPF(paciente.cpfPaciente)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editando === paciente.idPaciente ? (
                        <input
                          type="date"
                          value={pacienteEdit?.dataNascimento || ''}
                          onChange={(e) => handleEditChange('dataNascimento', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-600">
                          {formatarData(paciente.dataNascimento)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {calcularIdade(paciente.dataNascimento)} anos
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editando === paciente.idPaciente ? (
                        <select
                          value={pacienteEdit?.tipoSanguineo || ''}
                          onChange={(e) => handleEditChange('tipoSanguineo', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Selecione</option>
                          {tiposSanguineos.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          paciente.tipoSanguineo.includes('+') 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {paciente.tipoSanguineo}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 space-y-1">
                        {paciente.email && (
                          <div className="truncate max-w-[150px]" title={paciente.email}>
                            {paciente.email}
                          </div>
                        )}
                        {paciente.telefone && (
                          <div>{paciente.telefone}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editando === paciente.idPaciente ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={salvarEdicao}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 cursor-pointer transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelarEdicao}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 cursor-pointer transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => iniciarEdicao(paciente)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 cursor-pointer transition-colors"
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pacientes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum paciente encontrado.</p>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Informações:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Clique em "Editar" para atualizar informações do paciente</li>
            <li>• Campos editáveis: Nome, Data de Nascimento e Tipo Sanguíneo</li>
            <li>• RGHC e CPF são informações fixas e não podem ser alteradas</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

// Dados mock para desenvolvimento
function getMockPacientes(): Paciente[] {
  return [
    {
      idPaciente: 1,
      identificadorRghc: "RGHC00123",
      cpfPaciente: "11122233344",
      nomePaciente: "Ana Silva",
      dataNascimento: "1985-03-15",
      tipoSanguineo: "A+",
      email: "ana.silva@email.com",
      telefone: "(11) 99999-9999"
    },
    {
      idPaciente: 2,
      identificadorRghc: "RGHC00456",
      cpfPaciente: "22233344455",
      nomePaciente: "João Oliveira",
      dataNascimento: "1990-07-22",
      tipoSanguineo: "O-",
      email: "joao.oliveira@email.com",
      telefone: "(11) 88888-8888"
    },
    {
      idPaciente: 3,
      identificadorRghc: "RGHC00789",
      cpfPaciente: "33344455566",
      nomePaciente: "Maria Santos",
      dataNascimento: "1978-12-01",
      tipoSanguineo: "B+",
      email: "maria.santos@email.com",
      telefone: "(11) 77777-7777"
    }
  ];
}