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
  
      // Tarkistetaan kirjautuminen sekä localStoragesta että cookiesta
      let userData = null
      try {
        const localData = localStorage.getItem('userData')
        if (localData) {
          userData = JSON.parse(localData)
        } else {
          // Tarkista cookie jos localStorage on tyhjä
          const cookies = document.cookie.split(';')
          const userCookie = cookies.find(c => c.trim().startsWith('userData='))
          if (userCookie) {
            userData = JSON.parse(userCookie.split('=')[1])
            // Tallenna myös localStorageen
            localStorage.setItem('userData', JSON.stringify(userData))
            localStorage.setItem('userCode', userData.Koodi)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
  
      if (!userData || !userData.Access || userData.Access !== 'TRUE') {
        localStorage.removeItem('userData')
        localStorage.removeItem('userCode')
        router.push('/login')
        return
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