'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const DEMO_LAULU_ID = '48'
const DEMO_AIHE_ID = '10'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Tarkistetaan kirjautuminen vain kerran komponentin mountissa
    const checkAuth = async () => {
      // Sallitut reitit ilman kirjautumista
      if (
        pathname === '/login' ||
        pathname === '/' ||
        pathname?.startsWith('/tutustu') ||
        pathname === `/aiheet/${DEMO_AIHE_ID}/laulut/${DEMO_LAULU_ID}` ||
        pathname?.startsWith(`/audio/${DEMO_LAULU_ID}`) ||
        pathname?.startsWith(`/pdf/${DEMO_LAULU_ID}`) ||
        pathname?.startsWith(`/pelit/${DEMO_LAULU_ID}`) ||
        pathname?.startsWith('/viewer')
      ) {
        setIsLoading(false)
        return
      }

      // Tarkistetaan kirjautuminen
      const userData = localStorage.getItem('userData')
      if (!userData) {
        router.push('/')
        return
      }

      try {
        // Tarkistetaan userData:n voimassaolo
        const user = JSON.parse(userData)
        if (!user || !user.Access || user.Access !== 'TRUE') {
          localStorage.removeItem('userData')
          localStorage.removeItem('userCode')
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Error parsing userData:', error)
        localStorage.removeItem('userData')
        localStorage.removeItem('userCode')
        router.push('/')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  if (isLoading) {
    return <div>Ladataan...</div> // tai joku loading-spinner
  }

  return <>{children}</>
}