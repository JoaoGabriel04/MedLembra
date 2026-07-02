'use client'

import { SWRConfig } from 'swr'
import { api } from './api'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (path: string) => api(path),
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
