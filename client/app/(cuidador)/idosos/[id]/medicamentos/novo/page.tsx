'use client'

import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { FormularioMedicamento } from '@/components/cuidador/formulario-medicamento'
import { criarMedicamento } from '@/hooks/use-medicamentos'
import type { CriarMedicamentoInput } from '@/types/api'

export default function NovoMedicamentoPage() {
  const { id } = useParams<{ id: string }>()
  const idosoId = Number(id)
  const router = useRouter()

  async function handleSubmit(data: CriarMedicamentoInput) {
    try {
      await criarMedicamento(idosoId, data)
      toast.success('Medicamento cadastrado com sucesso')
      router.push(`/idosos/${id}/medicamentos`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível cadastrar')
      throw err
    }
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-foreground mb-6">Novo medicamento</h2>
      <div className="bg-card rounded-lg border border-border shadow-card p-6">
        <FormularioMedicamento onSubmit={handleSubmit} submitLabel="Cadastrar medicamento" />
      </div>
    </div>
  )
}
