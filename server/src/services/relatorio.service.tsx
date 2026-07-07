import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { assertAccessToIdoso } from '../utils/acesso'
import { getInicioNDiasFortaleza, getHojeFortaleza } from '../utils/datas'
import { calcularAlertas } from '../utils/alertas'
import * as usuariosRepo from '../repositories/usuarios.repository'
import * as medicamentosRepo from '../repositories/medicamentos.repository'
import * as registrosRepo from '../repositories/registros.repository'
import { AppError } from '../lib/errors'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#1a1a1a' },
  header: { marginBottom: 20 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#3b5de7' },
  subtitulo: { fontSize: 12, color: '#555', marginTop: 4 },
  secao: { marginTop: 16 },
  secaoTitulo: { fontSize: 11, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4, marginBottom: 8 },
  linha: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 140, color: '#666' },
  valor: { flex: 1 },
  tabela: { marginTop: 4 },
  tabelaHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 6, fontWeight: 'bold' },
  tabelaLinha: { flexDirection: 'row', padding: 6, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  colNome: { flex: 2 },
  colDosagem: { flex: 1 },
  colFreq: { width: 60, textAlign: 'center' },
  colEstoque: { width: 60, textAlign: 'center' },
  alerta: { padding: 6, marginBottom: 4, backgroundColor: '#fffbeb', borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  rodape: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#aaa' },
})


export async function gerarRelatorio(cuidadorId: number, idosoId: number, periodosDias: 7 | 30): Promise<Buffer> {
  await assertAccessToIdoso(cuidadorId, 'CUIDADOR', idosoId)

  const idoso = await usuariosRepo.findByIdSelect(idosoId)
  if (!idoso) throw new AppError(404, 'NOT_FOUND', 'Idoso não encontrado')

  const medicamentos = await medicamentosRepo.findMany(idosoId)
  const inicio = getInicioNDiasFortaleza(periodosDias)
  const registros = await registrosRepo.findStatusSince(idosoId, inicio)

  const totalTomadas = registros.filter(r => r.status === 'TOMADO').length
  const totalPuladas = registros.filter(r => r.status === 'PULADO').length
  const totalDosesAgendadas = medicamentos.reduce((acc, m) => acc + m.frequenciaDiaria * periodosDias, 0)
  const totalPendentes = Math.max(0, totalDosesAgendadas - totalTomadas - totalPuladas)
  const adesao = totalDosesAgendadas > 0 ? Math.round((totalTomadas / totalDosesAgendadas) * 100) : 0

  const medicamentosParaAlerta = medicamentos.map(m => ({
    id: m.id,
    nome: m.nome,
    estoqueAtual: m.estoqueAtual,
    frequenciaDiaria: m.frequenciaDiaria,
    dataValidade: m.dataValidade
  }))
  const alertas = calcularAlertas(medicamentosParaAlerta)

  const { dataStr: hoje } = getHojeFortaleza()

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.titulo}>MediSmart</Text>
          <Text style={styles.subtitulo}>Relatório de Adesão Medicamentosa</Text>
        </View>

        {/* Dados do paciente */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Dados do Paciente</Text>
          <View style={styles.linha}>
            <Text style={styles.label}>Paciente:</Text>
            <Text style={styles.valor}>{idoso.nome}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Período analisado:</Text>
            <Text style={styles.valor}>Últimos {periodosDias} dias</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Data de emissão:</Text>
            <Text style={styles.valor}>{hoje}</Text>
          </View>
        </View>

        {/* Resumo de adesão */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Resumo de Adesão</Text>
          <View style={styles.linha}>
            <Text style={styles.label}>Medicamentos ativos:</Text>
            <Text style={styles.valor}>{medicamentos.length}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Taxa de adesão:</Text>
            <Text style={styles.valor}>{adesao}%</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Doses agendadas:</Text>
            <Text style={styles.valor}>{totalDosesAgendadas}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Doses tomadas:</Text>
            <Text style={styles.valor}>{totalTomadas}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Doses puladas:</Text>
            <Text style={styles.valor}>{totalPuladas}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Doses pendentes:</Text>
            <Text style={styles.valor}>{totalPendentes}</Text>
          </View>
        </View>

        {/* Tabela de medicamentos */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Medicamentos Ativos</Text>
          <View style={styles.tabela}>
            <View style={styles.tabelaHeader}>
              <Text style={styles.colNome}>Nome</Text>
              <Text style={styles.colDosagem}>Dosagem</Text>
              <Text style={styles.colFreq}>Freq/dia</Text>
              <Text style={styles.colEstoque}>Estoque</Text>
            </View>
            {medicamentos.map(m => (
              <View key={m.id} style={styles.tabelaLinha}>
                <Text style={styles.colNome}>{m.nome}</Text>
                <Text style={styles.colDosagem}>{m.dosagem}</Text>
                <Text style={styles.colFreq}>{m.frequenciaDiaria}x</Text>
                <Text style={styles.colEstoque}>{m.estoqueAtual}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Alertas */}
        {alertas.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Alertas Ativos</Text>
            {alertas.map((a, i) => (
              <View key={i} style={styles.alerta}>
                <Text style={{ fontWeight: 'bold' }}>{a.medicamentoNome}</Text>
                <Text>
                  {a.tipo === 'ESTOQUE_BAIXO'
                    ? `Estoque acaba em ${a.diasRestantes} dia(s)`
                    : `Validade em ${a.diasParaVencer} dia(s) — ${a.dataValidade}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Rodapé */}
        <Text style={styles.rodape}>
          Este relatório foi gerado automaticamente pelo MediSmart e não substitui orientação médica profissional.
        </Text>

      </Page>
    </Document>
  )

  return Buffer.from(await renderToBuffer(doc))
}
