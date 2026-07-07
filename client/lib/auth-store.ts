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
        set({ token, usuario })
      },
      logout: () => {
        set({ token: null, usuario: null })
      },
      setHidratado: () => set({ hidratado: true }),
    }),
    {
      name: 'medismart-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHidratado()
      },
    }
  )
)
