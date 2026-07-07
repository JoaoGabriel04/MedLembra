'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Loader2, Plus, Search, Trash2 } from 'lucide-react'
import useSWR from 'swr'
import { zodResolver } from '@/lib/form'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BuscaExternaResponse, CriarMedicamentoInput } from '@/types/api'

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
  const nomeValue = watch('nome')

  // Debounce for autocomplete
  const [debouncedQ, setDebouncedQ] = useState('')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(nomeValue?.trim() ?? '')
    }, 400)
    return () => clearTimeout(timer)
  }, [nomeValue])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buscaAtiva = debouncedQ.length >= 3

  const { data: buscaData, isLoading: buscando } = useSWR<BuscaExternaResponse>(
    buscaAtiva ? swrKeys.buscaExterna(debouncedQ) : null,
    (key: string) => api<BuscaExternaResponse>(key),
    { revalidateOnFocus: false, onSuccess: () => setDropdownAberto(true) }
  )

  const sugestoes = buscaData?.resultados ?? []
  const buscandoOuDebouncing = (nomeValue?.trim().length ?? 0) >= 3 && (buscando || debouncedQ !== nomeValue?.trim())

  function selecionarSugestao(sugestao: { nome: string; dosagemSugerida: string | null }) {
    setValue('nome', sugestao.nome, { shouldValidate: true })
    if (sugestao.dosagemSugerida) {
      setValue('dosagem', sugestao.dosagemSugerida, { shouldValidate: true })
    }
    setDropdownAberto(false)
  }

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

        {/* Nome do medicamento — with autocomplete */}
        <div className="relative" ref={dropdownRef}>
          <Input
            label="Nome do medicamento"
            placeholder="Ex: Losartana"
            icon={buscandoOuDebouncing
              ? <Loader2 className="animate-spin" />
              : <Search />
            }
            error={errors.nome?.message}
            autoComplete="off"
            {...register('nome')}
            onFocus={() => sugestoes.length > 0 && setDropdownAberto(true)}
          />
          {dropdownAberto && sugestoes.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 top-full left-0 right-0 mt-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] max-h-48 overflow-y-auto"
            >
              {sugestoes.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={() => selecionarSugestao(s)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-alt)] transition-colors"
                  >
                    <span className="font-medium">{s.nome}</span>
                    {s.dosagemSugerida && (
                      <span className="ml-2 text-[var(--color-text-label)]">{s.dosagemSugerida}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

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
