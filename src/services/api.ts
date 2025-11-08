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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
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
    return this.request(`/consultas/pacientes/${pacienteId}`);
  }

  async createConsulta(consultaData: any) {
    return this.request('/consultas', {
      method: 'POST',
      body: JSON.stringify(consultaData),
    });
  }

  async updateConsultaStatus(consultaId: number, novoStatus: number) {
    return this.request(`/consultas/${consultaId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ novoStatus }),
    });
  }

  // Especialidades endpoints
  async getEspecialidades() {
    return this.request('/especialidades');
  }

  // Profissionais endpoints
  async getProfissionais() {
    return this.request('/profissionais');
  }

  // Disponibilidade endpoints
  async getDisponibilidade(especialidadeId: number, data?: string) {
    const params = new URLSearchParams();
    params.append('especialidade', especialidadeId.toString());
    if (data) {
      params.append('data', data);
    }
    return this.request(`/agenda/disponibilidade?${params}`);
  }
}

export default ApiService;