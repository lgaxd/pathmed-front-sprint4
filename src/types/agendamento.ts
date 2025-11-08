export interface Agendamento {
    id: string;
    rghcPaciente: string;
    especialidade: string; // Mudado de tipo específico para string genérica
    data: string;
    horario: string;
    status: "Agendado" | "Cancelado" | "Concluído";
    medicoNome: string;
}