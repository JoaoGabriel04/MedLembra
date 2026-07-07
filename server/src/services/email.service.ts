import { Resend } from 'resend'
import { Alerta } from '../utils/alertas'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'MediSmart <alertas@medismart.dev>'

export async function enviarAlertaEmail(params: {
  cuidadorEmail: string
  cuidadorNome: string
  idosoNome: string
  medicamentoNome: string
  alerta: Alerta
}): Promise<void> {
  const { cuidadorEmail, cuidadorNome, idosoNome, medicamentoNome, alerta } = params

  const tipoLegivel = alerta.tipo === 'ESTOQUE_BAIXO'
    ? 'O estoque está acabando'
    : 'A validade está próxima'

  const detalhe = alerta.tipo === 'ESTOQUE_BAIXO'
    ? `Dias restantes de estoque: <strong>${alerta.diasRestantes}</strong>`
    : `Data de validade: <strong>${alerta.dataValidade}</strong> (${alerta.diasParaVencer} dias restantes)`

  const html = `
    <h2>Alerta de Medicamento — MediSmart</h2>
    <p>Olá, <strong>${cuidadorNome}</strong>!</p>
    <p>Um medicamento de <strong>${idosoNome}</strong> precisa de atenção:</p>
    <ul>
      <li><strong>Medicamento:</strong> ${medicamentoNome}</li>
      <li><strong>Situação:</strong> ${tipoLegivel}</li>
      <li>${detalhe}</li>
    </ul>
    <p>Acesse o MediSmart para verificar e tomar as providências necessárias.</p>
    <hr />
    <p style="color:#888;font-size:12px;">Este é um aviso automático do MediSmart. Não responda a este e-mail.</p>
  `

  await resend.emails.send({
    from: FROM,
    to: [cuidadorEmail],
    subject: `Alerta: ${medicamentoNome} precisa de atenção`,
    html
  })
}

export async function enviarCodigoVerificacao(params: {
  email: string
  nome: string
  codigo: string
}): Promise<void> {
  const { email, nome, codigo } = params
  const html = `
    <h2 style="color:#3b5de7;">MediSmart — Verificação de E-mail</h2>
    <p>Olá, <strong>${nome}</strong>! Bem-vindo ao MediSmart.</p>
    <p>Seu código de verificação é:</p>
    <div style="font-size:40px;font-weight:bold;letter-spacing:10px;text-align:center;padding:20px;background:#f1f5f9;border-radius:8px;margin:20px 0;">
      ${codigo}
    </div>
    <p>Este código é válido por <strong>15 minutos</strong>.</p>
    <p>Se você não criou uma conta no MediSmart, ignore este e-mail.</p>
    <hr />
    <p style="color:#888;font-size:12px;">MediSmart — gerenciamento de medicamentos para idosos.</p>
  `
  await resend.emails.send({
    from: FROM,
    to: [email],
    subject: 'Seu código de verificação MediSmart',
    html
  })
}
