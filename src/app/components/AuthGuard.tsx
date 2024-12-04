'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const DEMO_LAULU_ID = '48' // Puetaan-laulun ID
const DEMO_AIHE_ID = '10'  // Laulun aiheen ID

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Sallitaan kirjautuminen
    if (pathname === '/login') {
      return
    }

    // Sallitaan /tutustu ja sen alasivut
    if (pathname?.startsWith('/tutustu')) {
      return
    }

    // Sallitaan demo-laulun sivu ja siihen liittyvät sivut
    if (
      pathname === `/aiheet/${DEMO_AIHE_ID}/laulut/${DEMO_LAULU_ID}` ||
      pathname?.startsWith(`/audio/${DEMO_LAULU_ID}`) ||
      pathname?.startsWith(`/pdf/${DEMO_LAULU_ID}`) ||
      pathname?.startsWith(`/pelit/${DEMO_LAULU_ID}`) ||
      pathname?.startsWith('/viewer')
    ) {
      return
    }

    // Sallitaan etusivu
    if (pathname === '/') {
      return
    }

    // Kaikki muu vaatii kirjautumisen
    const userData = localStorage.getItem('userData')
    if (!userData) {
      router.push('/')
    }
  }, [pathname, router])

  return <>{children}</>
}