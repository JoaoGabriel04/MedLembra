import { AuthGuard } from '@/components/auth-guard'
import { HeaderTopo } from '@/components/header-topo'

export default function CuidadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireTipo="CUIDADOR">
      <div className="min-h-screen bg-background flex flex-col">
        <HeaderTopo />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}
