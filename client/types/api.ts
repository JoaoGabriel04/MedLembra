// Enums
export type TipoUsuario = 'IDOSO' | 'CUIDADOR'
export type StatusTomada = 'TOMADO' | 'PULADO'
export type StatusHoje = StatusTomada | 'PENDENTE'

// Auth
export interface Usuario {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

// /usuarios/me
export interface MeResponse {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
  cuidador: { id: number; nome: string; email: string } | null
  idosos: Array<{ id: number; nome: string; email: string }>
}

// Cuidador
export interface CuidadorIdososResponse {
  idosos: Array<{ id: number; nome: string; email: string }>
}

// Medicamentos
export interface Horario {
  id: number
  hora: string
}

export interface Medicamento {
  id: number
  idosoId: number
  nome: string
  dosagem: string
  frequenciaDiaria: number
  estoqueAtual: number
  dataValidade: string
  horarios: Horario[]
}

export interface MedicamentosResponse {
  medicamentos: Medicamento[]
}

// GET/POST/PUT de um medicamento retornam o objeto direto, sem envelope
// (INSTRUCOES_API.md 5.3: "mesmo formato de um item de GET /medicamentos")
export type MedicamentoResponse = Medicamento

export interface CriarMedicamentoInput {
  nome: string
  dosagem: string
  frequenciaDiaria: number
  estoqueAtual: number
  dataValidade: string
  horarios: string[]
}

export type AtualizarMedicamentoInput = Partial<CriarMedicamentoInput>

// Registros
export interface Registro {
  id: number
  horarioId: number | null
  dataHora: string
  status: StatusTomada
}

export interface CriarRegistroInput {
  status: StatusTomada
  horarioId?: number
  dataHora?: string
}

export interface CriarRegistroResponse {
  registro: Registro
  medicamento: { id: number; estoqueAtual: number }
}

export interface RegistrosResponse {
  registros: Registro[]
  total: number
}

// /idoso/hoje
export interface HorarioHoje {
  horarioId: number
  hora: string
  status: StatusHoje
  registroId: number | null
  registradoEm: string | null
}

export interface MedicamentoHoje {
  id: number
  nome: string
  dosagem: string
  estoqueAtual: number
  horarios: HorarioHoje[]
}

export interface HojeResponse {
  data: string
  medicamentos: MedicamentoHoje[]
}

// Alertas
export interface AlertaEstoqueBaixo {
  tipo: 'ESTOQUE_BAIXO'
  medicamentoId: number
  medicamentoNome: string
  diasRestantes: number
}

export interface AlertaValidadeProxima {
  tipo: 'VALIDADE_PROXIMA'
  medicamentoId: number
  medicamentoNome: string
  diasParaVencer: number
  dataValidade: string
}

export type Alerta = AlertaEstoqueBaixo | AlertaValidadeProxima

export type AlertaGlobal = Alerta & {
  idosoId: number
  idosoNome: string
}

// Dashboard
export interface DashboardResponse {
  idoso: { id: number; nome: string; email: string }
  resumo: {
    totalMedicamentos: number
    adesao7dias: number
    totalDosesAgendadas7dias: number
    totalTomadas7dias: number
    totalPuladas7dias: number
    totalPendentes7dias: number
  }
  alertas: Alerta[]
}

export interface AlertasResponse {
  alertas: AlertaGlobal[]
}
