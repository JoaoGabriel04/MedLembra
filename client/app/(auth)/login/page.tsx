'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Lock, Pill, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@/lib/form'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { AuthResponse } from '@/types/api'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      const res = await api<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      login(res.token, res.usuario)
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível concluir a ação')
    }
  }

  return (
    <div className="w-full max-w-[960px] min-h-[560px] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-elevated">

      {/* Painel esquerdo — gradiente azul */}
      <div
        className="flex flex-col p-10 text-white md:w-1/2"
        style={{ background: 'var(--gradient-hero-login)' }}
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
            <ShieldCheck className="size-6 text-white" />
          </div>
          <h1 className="text-[28px] font-bold leading-snug">
            Segurança e Conexão em tempo real.
          </h1>
          <p className="text-white/80 text-[15px] leading-relaxed">
            Acesse o painel para monitorar as rotinas medicamentosas de seus familiares.
          </p>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-sm">Feito para cuidar de quem cuida.</p>
      </div>

      {/* Painel direito — branco */}
      <div className="flex flex-col justify-center gap-8 p-10 bg-card md:w-1/2">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3">
          <div className="size-11 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Lock className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold text-foreground leading-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Insira suas credenciais para acessar a plataforma.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.senha?.message}
            {...register('senha')}
          />
          <Button
            type="submit"
            variant="primary"
            size="cta"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Link registro */}
        <p className="text-center text-sm text-muted-foreground">
          Não possui uma conta?{' '}
          <Link href="/registrar" className="font-semibold text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
