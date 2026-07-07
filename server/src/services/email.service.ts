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
