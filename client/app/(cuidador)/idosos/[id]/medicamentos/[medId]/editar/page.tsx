'use client'

import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { FormularioMedicamento } from '@/components/cuidador/formulario-medicamento'
import { useMedicamento, atualizarMedicamento } from '@/hooks/use-medicamentos'
import type { CriarMedicamentoInput } from '@/types/api'

export default function EditarMedicamentoPage() {
  const { id, medId } = useParams<{ id: string; medId: string }>()
  const idosoId = Number(id)
  const medicamentoId = Number(medId)
  const router = useRouter()

  const { data, isLoading } = useMedicamento(medicamentoId)
  const med = data

  async function handleSubmit(formData: CriarMedicamentoInput) {
    try {
      await atualizarMedicamento(medicamentoId, idosoId, formData)
      toast.success('Medicamento atualizado com sucesso')
      router.push(`/idosos/${id}/medicamentos`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar')
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!med) return null

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-foreground mb-6">Editar {med.nome}</h2>
      <div className="bg-card rounded-lg border border-border shadow-card p-6">
        <FormularioMedicamento
          defaultValues={{
            nome: med.nome,
            dosagem: med.dosagem,
            frequenciaDiaria: med.frequenciaDiaria,
            estoqueAtual: med.estoqueAtual,
            dataValidade: med.dataValidade.slice(0, 10),
            horarios: med.horarios.map((h) => ({ hora: h.hora })),
          }}
          onSubmit={handleSubmit}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  )
}
