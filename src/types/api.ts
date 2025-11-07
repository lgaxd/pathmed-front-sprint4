export interface Paciente {
  idPaciente: number;
  identificadorRghc: string;
  cpfPaciente: string;
  nomePaciente: string;
  dataNascimento: string;
  tipoSanguineo: string;
  email?: string;
  telefone?: string;
}

export interface Consulta {
  idConsulta: number;
  idPaciente: number;
  idProfissional: number;
  idStatus: number;
  dataHoraConsulta: string;
  medicoNome?: string;
  especialidade?: string;
}

export interface Especialidade {
  idEspecialidade: number;
  descricaoEspecialidade: string;
}

export interface Profissional {
  idProfissional: number;
  idEspecialidade: number;
  nomeProfissionalSaude: string;
  emailCorporativoProfissional: string;
}

export interface LoginRequest {
  usuario: string;
  senha: string;
  tipoUsuario: string;
}

export interface LoginResponse {
  sucesso: boolean;
  mensagem: string;
  idUsuario?: number;
  nomeUsuario?: string;
  tipoUsuario?: string;
}