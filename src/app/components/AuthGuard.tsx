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
        router.push('/login')
        setIsLoading(false)
        return
      }

      try {
        // Tarkistetaan userData:n voimassaolo
        const user = JSON.parse(userData)
        if (!user || !user.Access || user.Access !== 'TRUE') {
          localStorage.removeItem('userData')
          localStorage.removeItem('userCode')
          document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          router.push('/login')
        }
      } catch (error) {
        console.error('Error parsing userData:', error)
        localStorage.removeItem('userData')
        localStorage.removeItem('userCode')
        document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        router.push('/login')
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}