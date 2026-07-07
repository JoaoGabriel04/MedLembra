'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import { Button } from '@/components/ui/button'
import { useMedicamentos, deletarMedicamento } from '@/hooks/use-medicamentos'
import type { Medicamento } from '@/types/api'

function ConfirmarExclusao({
  nome,
  onConfirm,
  onCancel,
}: {
  nome: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="w-full max-w-sm bg-card rounded-xl shadow-elevated p-8 flex flex-col gap-5">
      <div>
        <Dialog.Title className="text-[20px] font-semibold text-foreground">
          Excluir medicamento?
        </Dialog.Title>
        <Dialog.Description className="text-sm text-muted-foreground mt-1">
          <span className="font-medium text-foreground">{nome}</span> será removido
          permanentemente, incluindo todos os registros de tomada.
        </Dialog.Description>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="default" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="default"
          className="flex-1 !bg-destructive !text-white hover:!bg-red-700"
          onClick={onConfirm}
        >
          Excluir
        </Button>
      </div>
    </div>
  )
}

function MedicamentoRow({
  med,
  idosoId,
  idParam,
}: {
  med: Medicamento
  idosoId: number
  idParam: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deletarMedicamento(med.id, idosoId)
      toast.success('Medicamento excluído')
    } catch {
      toast.error('Não foi possível excluir')
      setDeleting(false)
    }
    setConfirming(false)
  }

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="py-3.5 pl-5 pr-4">
          <p className="text-sm font-medium text-foreground">{med.nome}</p>
          <p className="text-xs text-muted-foreground">{med.dosagem}</p>
        </td>
        <td className="py-3.5 pr-4 text-sm text-foreground">
          {med.frequenciaDiaria}x ao dia
        </td>
        <td className="py-3.5 pr-4 text-sm text-foreground">{med.estoqueAtual}</td>
        <td className="py-3.5 pr-4 text-sm text-foreground">
          {format(parseISO(med.dataValidade), 'dd/MM/yyyy')}
        </td>
        <td className="py-3.5 pl-4 pr-5 text-right">
          <div className="inline-flex items-center gap-1">
            <Link
              href={`/idosos/${idParam}/medicamentos/${med.id}/editar`}
              aria-label={`Editar ${med.nome}`}
              className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="size-4" />
            </Link>
            <button
              onClick={() => setConfirming(true)}
              disabled={deleting}
              aria-label={`Excluir ${med.nome}`}
              className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </td>
      </tr>

      <Dialog.Root
        open={confirming}
        onOpenChange={(open) => { if (!open) setConfirming(false) }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <ConfirmarExclusao
              nome={med.nome}
              onConfirm={handleDelete}
              onCancel={() => setConfirming(false)}
            />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

export default function MedicamentosPage() {
  const { id } = useParams<{ id: string }>()
  const idosoId = Number(id)
  const { data, isLoading } = useMedicamentos(idosoId)

  const medicamentos = data?.medicamentos ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {medicamentos.length} medicamento{medicamentos.length !== 1 ? 's' : ''} cadastrado
          {medicamentos.length !== 1 ? 's' : ''}
        </p>
        <Link
          href={`/idosos/${id}/medicamentos/novo`}
          className="inline-flex items-center gap-1.5 px-3 h-9 text-sm font-semibold text-white rounded-md [background:var(--gradient-primary)] hover:brightness-95 transition-all"
        >
          <Plus className="size-4" />
          Novo medicamento
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && medicamentos.length === 0 && (
        <div className="text-center py-16 text-sm text-muted-foreground">
          Nenhum medicamento cadastrado ainda.
        </div>
      )}

      {!isLoading && medicamentos.length > 0 && (
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-3 pl-5 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
                  Medicamento
                </th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
                  Frequência
                </th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
                  Estoque
                </th>
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
                  Validade
                </th>
                <th className="py-3 pl-4 pr-5 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.map((med) => (
                <MedicamentoRow key={med.id} med={med} idosoId={idosoId} idParam={id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
