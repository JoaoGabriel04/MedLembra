'use client'

import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { HeartPulse, Pill, User, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@/lib/form'
import { api } from '@/lib/api'
import type { RegisterResponse, TipoUsuario } from '@/types/api'

const schema = z
  .object({
    nome: z.string().min(2, 'Nome obrigatório'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmarSenha: z.string().min(1, 'Confirme a senha'),
    tipo: z.enum(['IDOSO', 'CUIDADOR']),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  })

type FormData = z.infer<typeof schema>

const TIPOS: { value: TipoUsuario; label: string; sub: string; desc: string; icon: typeof User }[] =
  [
    {
      value: 'IDOSO',
      label: 'Idoso',
      sub: 'Paciente',
      desc: 'Gerencia seus próprios medicamentos.',
      icon: User,
    },
    {
      value: 'CUIDADOR',
      label: 'Cuidador',
      sub: 'Familiar',
      desc: 'Acompanha medicamentos de familiares.',
      icon: HeartPulse,
    },
  ]

export default function RegistrarPage() {
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const { confirmarSenha: _, ...payload } = data
    try {
      const res = await api<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      toast.success(res.message)
      router.push(`/verificar-email?email=${encodeURIComponent(res.email)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível concluir a ação')
    }
  }

  return (
    <div className="w-full max-w-[960px] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-elevated">

      {/* Painel esquerdo — gradiente violeta */}
      <div
        className="flex flex-col p-10 text-white md:w-1/2"
        style={{ background: 'var(--gradient-hero-register)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-white/20 flex items-center justify-center shrink-0">
            <Pill className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold">MediSmart</span>
        </div>

        {/* Conteúdo central */}
        <div className="flex flex-col gap-4 my-auto py-10">
          <div className="size-11 rounded-md bg-white/20 flex items-center justify-center">
            <HeartPulse className="size-6 text-white" />
          </div>
          <h1 className="text-[28px] font-bold leading-snug">
            Cadastre-se para começar.
          </h1>
          <p className="text-white/80 text-[15px] leading-relaxed">
            Conecte idosos e cuidadores num só lugar. Cadastros diários simples e alertas para quem cuida.
          </p>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-sm">MediSmart — feito para cuidar de quem cuida.</p>
      </div>

      {/* Painel direito — branco */}
      <div className="flex flex-col gap-6 p-10 bg-card md:w-1/2">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3">
          <div className="size-11 rounded-full bg-primary flex items-center justify-center shrink-0">
            <UserPlus className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold text-foreground leading-tight">Criar Conta</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Cadastre-se para começar a gerenciar seus medicamentos.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Nome completo"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            error={errors.nome?.message}
            {...register('nome')}
          />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.senha?.message}
              {...register('senha')}
            />
            <Input
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.confirmarSenha?.message}
              {...register('confirmarSenha')}
            />
          </div>

          {/* Seletor de tipo */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
              Sou um...
            </span>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  {TIPOS.map(({ value, label, sub, desc, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={cn(
                        'flex flex-col gap-2 rounded-lg border p-4 text-left transition-all',
                        field.value === value
                          ? 'border-[var(--color-primary)] bg-[rgba(59,93,231,0.04)]'
                          : 'border-border bg-background hover:border-[var(--color-border-strong)]'
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-5',
                          field.value === value ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {label}{' '}
                          <span className="font-normal text-muted-foreground">/ {sub}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.tipo && (
              <p className="text-xs text-destructive">{errors.tipo.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="cta"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        {/* Link login */}
        <p className="text-center text-sm text-muted-foreground">
          Já possui uma conta?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
