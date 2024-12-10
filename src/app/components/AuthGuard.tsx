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
  
      let authData = null
  
      // Kokeillaan localStorage
      const localData = localStorage.getItem('kielinuppuAuth')
      console.log('localStorage auth data:', localData)
  
      if (localData) {
        try {
          authData = JSON.parse(localData)
          console.log('Auth data parsittu localStoragesta:', authData)
        } catch (error) {
          console.error('LocalStorage parse error:', error)
        }
      }
  
      // Jos ei löytynyt, kokeillaan cookies
      if (!authData) {
        const cookies = document.cookie.split(';')
        console.log('Cookies:', cookies)
  
        const authCookie = cookies.find(c => c.trim().startsWith('kielinuppuAuth='))
        if (authCookie) {
          try {
            authData = JSON.parse(authCookie.split('=')[1])
            console.log('Auth data parsittu cookiesta:', authData)
            // Tallennetaan myös localStorageen
            localStorage.setItem('kielinuppuAuth', JSON.stringify(authData))
          } catch (error) {
            console.error('Cookie parse error:', error)
          }
        }
      }
  
      // Tarkista voimassaolo ja tiedot
      if (!authData || 
          !authData.expireDate || 
          authData.expireDate < new Date().getTime() ||
          !authData.userData?.Access || 
          authData.userData.Access !== 'TRUE' ||
          !authData.userCode || 
          authData.userCode !== authData.userData.Koodi) {
        console.log('Auth tiedot virheelliset tai vanhentuneet')
        localStorage.removeItem('kielinuppuAuth')
        router.push('/login')
        return
      }
  
      console.log('Kirjautuminen OK')
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