import * as medicamentosReferenciaRepo from '../repositories/medicamentos-referencia.repository'

interface ResultadoExterno {
  nome: string
  dosagemSugerida: string | null
}

export async function buscarMedicamentosExternos(q: string): Promise<ResultadoExterno[]> {
  const nomes = await medicamentosReferenciaRepo.buscar(q, 5)
  return nomes.map(nome => ({ nome, dosagemSugerida: null }))
}
