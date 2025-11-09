import { useState } from 'react';
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";

interface DadosRelatorio {
  periodo: string;
  consultasRealizadas: number;
  consultasCanceladas: number;
  taxaComparecimento: number;
  especialidadeMaisProcurada: string;
  pacienteFrequente: string;
  receitaTotal: number;
}

export function Relatorios() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mensal');

  // Dados mockados para relatórios
  const relatorios: { [key: string]: DadosRelatorio } = {
    diario: {
      periodo: 'Diário (Hoje)',
      consultasRealizadas: 24,
      consultasCanceladas: 2,
      taxaComparecimento: 92.3,
      especialidadeMaisProcurada: 'Cardiologia',
      pacienteFrequente: 'Ana Silva',
      receitaTotal: 4800
    },
    semanal: {
      periodo: 'Semanal',
      consultasRealizadas: 156,
      consultasCanceladas: 12,
      taxaComparecimento: 92.9,
      especialidadeMaisProcurada: 'Dermatologia',
      pacienteFrequente: 'João Oliveira',
      receitaTotal: 31200
    },
    mensal: {
      periodo: 'Mensal',
      consultasRealizadas: 648,
      consultasCanceladas: 48,
      taxaComparecimento: 93.1,
      especialidadeMaisProcurada: 'Pediatria',
      pacienteFrequente: 'Maria Santos',
      receitaTotal: 129600
    },
    trimestral: {
      periodo: 'Trimestral',
      consultasRealizadas: 1944,
      consultasCanceladas: 156,
      taxaComparecimento: 92.0,
      especialidadeMaisProcurada: 'Cardiologia',
      pacienteFrequente: 'Pedro Souza',
      receitaTotal: 388800
    }
  };

  const dadosAtuais = relatorios[periodoSelecionado];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatórios e Estatísticas</h1>
          <p className="text-gray-600">Acompanhe os dados e métricas do hospital</p>
        </div>

        {/* Filtros de Período */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecione o Período</h2>
          <div className="flex space-x-4">
            {Object.keys(relatorios).map(periodo => (
              <button
                key={periodo}
                onClick={() => setPeriodoSelecionado(periodo)}
                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  periodoSelecionado === periodo
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {relatorios[periodo].periodo}
              </button>
            ))}
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">{dadosAtuais.consultasRealizadas}</div>
            <div className="text-sm text-gray-600">Consultas Realizadas</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">{dadosAtuais.taxaComparecimento}%</div>
            <div className="text-sm text-gray-600">Taxa de Comparecimento</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-red-600 mb-2">{dadosAtuais.consultasCanceladas}</div>
            <div className="text-sm text-gray-600">Consultas Canceladas</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">{formatarMoeda(dadosAtuais.receitaTotal)}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Detalhadas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Detalhadas</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Especialidade Mais Procurada</span>
                <span className="text-sm text-blue-600">{dadosAtuais.especialidadeMaisProcurada}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-800">Paciente Mais Frequente</span>
                <span className="text-sm text-green-600">{dadosAtuais.pacienteFrequente}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-800">Média de Consultas/Dia</span>
                <span className="text-sm text-purple-600">
                  {Math.round(dadosAtuais.consultasRealizadas / (periodoSelecionado === 'diario' ? 1 : 
                    periodoSelecionado === 'semanal' ? 7 : 
                    periodoSelecionado === 'mensal' ? 30 : 90))}
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico Simulado */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Especialidade</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cardiologia</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">35%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dermatologia</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">25%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pediatria</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">20%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Outras</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ações</h2>
          <div className="flex space-x-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
              Exportar PDF
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
              Exportar Excel
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              Imprimir Relatório
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}