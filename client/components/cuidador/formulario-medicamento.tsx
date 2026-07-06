'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { zodResolver } from '@/lib/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CriarMedicamentoInput } from '@/types/api'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  dosagem: z.string().min(1, 'Dosagem é obrigatória'),
  frequenciaDiaria: z.coerce.number().int().min(1).max(10),
  estoqueAtual: z.coerce.number().int().min(0),
  dataValidade: z.string().min(1, 'Data de validade é obrigatória'),
  horarios: z.array(z.object({ hora: z.string().min(1, 'Horário obrigatório') })),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<FormValues>
  onSubmit: (data: CriarMedicamentoInput) => Promise<void>
  submitLabel?: string
}

export function FormularioMedicamento({ defaultValues, onSubmit, submitLabel = 'Salvar' }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      dosagem: '',
      frequenciaDiaria: 1,
      estoqueAtual: 0,
      dataValidade: '',
      horarios: [{ hora: '' }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'horarios' })
  const frequencia = watch('frequenciaDiaria')

  // Sync horarios array length with frequenciaDiaria
  useEffect(() => {
    const freq = Math.max(1, Math.min(10, Number(frequencia) || 1))
    if (fields.length < freq) {
      for (let i = fields.length; i < freq; i++) {
        append({ hora: '' }, { shouldFocus: false })
      }
    } else if (fields.length > freq) {
      for (let i = fields.length - 1; i >= freq; i--) {
        remove(i)
      }
    }
  }, [frequencia]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      nome: values.nome,
      dosagem: values.dosagem,
      frequenciaDiaria: values.frequenciaDiaria,
      estoqueAtual: values.estoqueAtual,
      dataValidade: values.dataValidade,
      horarios: values.horarios.map((h) => h.hora),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Nome do medicamento"
          placeholder="Ex: Losartana"
          error={errors.nome?.message}
          {...register('nome')}
        />
        <Input
          label="Dosagem"
          placeholder="Ex: 50mg"
          error={errors.dosagem?.message}
          {...register('dosagem')}
        />
        <Input
          label="Frequência diária"
          type="number"
          min={1}
          max={10}
          error={errors.frequenciaDiaria?.message}
          {...register('frequenciaDiaria')}
        />
        <Input
          label="Estoque atual (comprimidos)"
          type="number"
          min={0}
          error={errors.estoqueAtual?.message}
          {...register('estoqueAtual')}
        />
        <div className="sm:col-span-2">
          <Input
            label="Data de validade"
            type="date"
            error={errors.dataValidade?.message}
            {...register('dataValidade')}
          />
        </div>
      </div>

      {/* Horários dinâmicos */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
          Horários
        </p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                label=""
                type="time"
                error={errors.horarios?.[index]?.hora?.message}
                {...register(`horarios.${index}.hora`)}
              />
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                aria-label="Remover horário"
                onClick={() => {
                  remove(index)
                  setValue('frequenciaDiaria', fields.length - 1)
                }}
                className="mt-1 size-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}

        {fields.length < 10 && (
          <button
            type="button"
            onClick={() => {
              append({ hora: '' })
              setValue('frequenciaDiaria', fields.length + 1)
            }}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-[var(--color-primary-hover)] transition-colors self-start"
          >
            <Plus className="size-4" />
            Adicionar horário
          </button>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" size="cta" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
