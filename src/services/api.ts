class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        // Tentar obter mais detalhes do erro
        const errorText = await response.text();
        console.error('API error details:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Método para detectar se é API Java ou Python baseado na URL base
  private isJavaAPI(): boolean {
    return this.baseUrl.includes('pathmed.winty.cloud') || this.baseUrl.includes('/api/v1') === false;
  }

  // Auth endpoints
  async login(credentials: { usuario: string; senha: string; tipoUsuario: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerPaciente(pacienteData: any) {
    return this.request('/auth/pacientes/register', {
      method: 'POST',
      body: JSON.stringify(pacienteData),
    });
  }

  // Pacientes endpoints
  async getPacientes() {
    return this.request('/pacientes');
  }

  async getPacienteById(id: number) {
    return this.request(`/pacientes/${id}`);
  }

  async createPaciente(pacienteData: any) {
    return this.request('/pacientes', {
      method: 'POST',
      body: JSON.stringify(pacienteData),
    });
  }

  async updatePaciente(id: number, pacienteData: any) {
    return this.request(`/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pacienteData),
    });
  }

  // Consultas endpoints
  async getConsultas() {
    return this.request('/consultas');
  }

  async getConsultasPorPaciente(pacienteId: number) {
    return this.request(`/consultas/paciente/${pacienteId}`);
  }

  async createConsulta(consultaData: any) {
  if (this.isJavaAPI()) {
    // Formato Java - manter camelCase
    const bodyData = {
      idPaciente: parseInt(consultaData.idPaciente),
      idProfissional: parseInt(consultaData.idProfissional),
      dataHoraConsulta: consultaData.dataHoraConsulta
    };
    
    return this.request('/consultas', {
      method: 'POST',
      body: JSON.stringify(bodyData),
    });
  } else {
    // Formato Python - converter para snake_case
    const bodyData = {
      id_paciente: parseInt(consultaData.idPaciente),
      id_profissional: parseInt(consultaData.idProfissional), 
      data_hora_consulta: consultaData.dataHoraConsulta
    };

    console.log('📤 Enviando para API Python:', bodyData);

    // Usar fetch diretamente para ter mais controle
    const response = await fetch(`${this.baseUrl}/consultas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('❌ Detalhes do erro da API Python:', errorDetails);
      throw new Error(`Erro API Python: ${response.status} - ${errorDetails}`);
    }

    return await response.json();
  }
}

  async updateConsultaStatus(consultaId: number, novoStatus: number) {
    if (this.isJavaAPI()) {
      // Formato Java
      return this.request(`/consultas/${consultaId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ novoStatus }),
      });
    } else {
      // Formato Python
      return this.request(`/consultas/status`, {
        method: 'PUT',
        body: JSON.stringify({ consulta_id: consultaId, id_status: novoStatus }),
      });
    }
  }

  // Especialidades endpoints
  async getEspecialidades() {
    return this.request('/especialidades');
  }

  // Profissionais endpoints
  async getProfissionais() {
    return this.request('/profissionais');
  }

  // Disponibilidade endpoints - Adaptável para Java e Python
  async getDisponibilidade(especialidadeId: number, data?: string) {
    const params = new URLSearchParams();
    params.append('especialidade', especialidadeId.toString());
    if (data) {
      params.append('data', data);
    }

    if (this.isJavaAPI()) {
      // Endpoint Java
      return this.request(`/agenda/disponibilidade?${params}`);
    } else {
      // Endpoint Python
      return this.request(`/especialidades/disponibilidade?${params}`);
    }
  }
}

export default ApiService;