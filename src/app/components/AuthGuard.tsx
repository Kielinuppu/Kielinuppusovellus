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
      let userData: UserData | null = null

      // Kokeillaan ensin IndexedDB
      if ('indexedDB' in window) {
        try {
          const dbRequest = window.indexedDB.open('KielinuppuDB', 1)
          
          dbRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains('auth')) {
              db.createObjectStore('auth')
            }
          }

          dbRequest.onsuccess = (event: Event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const transaction = db.transaction(['auth'], 'readonly')
            const store = transaction.objectStore('auth')
            
            const request = store.get('userData')
            request.onsuccess = () => {
              if (request.result) {
                userData = request.result as UserData
              }
            }
          }
        } catch (error) {
          console.error('IndexedDB error:', error)
        }
      }

      // Jos ei löydy IndexedDB:stä, kokeillaan localStorage
      if (!userData) {
        const localData = localStorage.getItem('userData')
        if (localData) {
          try {
            userData = JSON.parse(localData) as UserData
          } catch (error) {
            console.error('LocalStorage parse error:', error)
          }
        }
      }

      // Jos ei löydy LocalStoragesta, kokeillaan cookieta
      if (!userData) {
        const cookies = document.cookie.split(';')
        const userCookie = cookies.find(c => c.trim().startsWith('userData='))
        if (userCookie) {
          try {
            userData = JSON.parse(userCookie.split('=')[1]) as UserData
            // Tallenna myös muihin tallennuspaikkoihin
            localStorage.setItem('userData', JSON.stringify(userData))
            if ('indexedDB' in window) {
              const dbRequest = window.indexedDB.open('KielinuppuDB', 1)
              dbRequest.onsuccess = (event: Event) => {
                const db = (event.target as IDBOpenDBRequest).result
                const transaction = db.transaction(['auth'], 'readwrite')
                const store = transaction.objectStore('auth')
                store.put(userData, 'userData')
              }
            }
          } catch (error) {
            console.error('Cookie parse error:', error)
          }
        }
      }

      if (!userData || !userData.Access || userData.Access !== 'TRUE') {
        localStorage.removeItem('userData')
        localStorage.removeItem('userCode')
        if ('indexedDB' in window) {
          const dbRequest = window.indexedDB.open('KielinuppuDB', 1)
          dbRequest.onsuccess = (event: Event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const transaction = db.transaction(['auth'], 'readwrite')
            const store = transaction.objectStore('auth')
            store.delete('userData')
            store.delete('userCode')
          }
        }
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