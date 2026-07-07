'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { MailCheck, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { AuthResponse } from '@/types/api'

function VerificarEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const login = useAuthStore((s) => s.login)

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [submitting, setSubmitting] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) router.replace('/registrar')
  }, [email, router])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function submit(code: string) {
    setSubmitting(true)
    try {
      const res = await api<AuthResponse>('/auth/verificar-email', {
        method: 'POST',
        body: JSON.stringify({ email, codigo: code })
      })
      login(res.token, res.usuario)
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Código inválido ou expirado')
      setDigits(Array(6).fill(''))
      setTimeout(() => inputs.current[0]?.focus(), 50)
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    if (digit && index === 5) {
      const code = next.join('')
      if (code.length === 6) submit(code)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    const lastIndex = Math.min(pasted.length - 1, 5)
    inputs.current[lastIndex]?.focus()
    if (pasted.length === 6) submit(pasted)
  }

  async function handleReenviar() {
    setReenviando(true)
    try {
      await api('/auth/reenviar-codigo', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      toast.success('Código reenviado! Verifique seu e-mail.')
      setCooldown(60)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível reenviar')
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div className="w-full max-w-[960px] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-elevated">

      {/* Left panel (oculto no mobile) */}
      <div
        className="hidden md:flex flex-col p-10 text-white md:w-1/2"
        style={{ background: 'var(--gradient-hero-login)' }}
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-white/20 flex items-center justify-center shrink-0">
            <Pill className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold">MediSmart</span>
        </div>
        <div className="flex flex-col gap-4 my-auto py-10">
          <div className="size-11 rounded-md bg-white/20 flex items-center justify-center">
            <MailCheck className="size-6 text-white" />
          </div>
          <h1 className="text-[28px] font-bold leading-snug">Verifique seu e-mail.</h1>
          <p className="text-white/80 text-[15px] leading-relaxed">
            Enviamos um código de 6 dígitos para o seu endereço de e-mail. Ele expira em 15 minutos.
          </p>
        </div>
        <p className="text-white/60 text-sm">MediSmart — feito para cuidar de quem cuida.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center gap-8 p-8 md:p-10 bg-card w-full md:w-1/2">
        {/* Logo compacta — só mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="size-7 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-primary)' }}>
            <Pill className="size-3.5 text-white" />
          </div>
          <span className="text-base font-bold text-foreground">MediSmart</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="size-11 rounded-full bg-primary flex items-center justify-center shrink-0">
            <MailCheck className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-[28px] font-bold text-foreground leading-tight">Confirmar e-mail</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Digite o código enviado para{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* 6-digit input */}
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={submitting}
                className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
              />
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="cta"
            className="w-full"
            disabled={submitting || digits.join('').length < 6}
            onClick={() => submit(digits.join(''))}
          >
            {submitting ? 'Verificando...' : 'Confirmar código'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Não recebeu o código?</p>
            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando || cooldown > 0}
              className="text-sm font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Reenviar em ${cooldown}s` : reenviando ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerificarEmailPage() {
  return (
    <Suspense>
      <VerificarEmailContent />
    </Suspense>
  )
}
