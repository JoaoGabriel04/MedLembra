import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TipoUsuario } from '@/types/api'

interface AuthUsuario {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
}

interface AuthState {
  token: string | null
  usuario: AuthUsuario | null
  hidratado: boolean
  login: (token: string, usuario: AuthUsuario) => void
  logout: () => void
  setHidratado: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      hidratado: false,
      login: (token, usuario) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('medlembra.token', token)
        }
        set({ token, usuario })
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('medlembra.token')
        }
        set({ token: null, usuario: null })
      },
      setHidratado: () => set({ hidratado: true }),
    }),
    {
      name: 'medlembra-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHidratado()
      },
    }
  )
)
