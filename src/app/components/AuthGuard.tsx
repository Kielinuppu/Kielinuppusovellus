'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { UserData } from '@/types/user'

const DEMO_LAULU_ID = '48'
const DEMO_AIHE_ID = '10'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthGuard tarkistaa kirjautumisen:', pathname)
      
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

      let userData: UserData | null = null

      // Kokeillaan localStorage
      const localData = localStorage.getItem('userData')
      console.log('localStorage data:', localData)

      if (localData) {
        try {
          userData = JSON.parse(localData)
          console.log('userData parsittu localStoragesta:', userData)
        } catch (error) {
          console.error('LocalStorage parse error:', error)
        }
      }

      // Jos ei löytynyt, kokeillaan cookies
      if (!userData) {
        const cookies = document.cookie.split(';')
        console.log('Cookies:', cookies)

        const userCookie = cookies.find(c => c.trim().startsWith('userData='))
        if (userCookie) {
          try {
            userData = JSON.parse(userCookie.split('=')[1])
            console.log('userData parsittu cookiesta:', userData)
            // Tallennetaan myös localStorageen, jos cookie löytyi
            localStorage.setItem('userData', JSON.stringify(userData))
          } catch (error) {
            console.error('Cookie parse error:', error)
          }
        }
      }

      // Tarkistetaan, onko userData validi
      if (!userData || !userData.Access || userData.Access !== 'TRUE') {
        console.log('Kirjautumistietoja ei löytynyt tai ne ovat virheelliset')
        localStorage.removeItem('userData')
        localStorage.removeItem('userCode')
        router.push('/login')
        return
      }

      console.log('Kirjautuminen OK')
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  // Näytetään latausruutu, kun tarkistetaan kirjautumista
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
