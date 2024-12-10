'use client'

import QuickImage from '@/components/QuickImage'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getFullImageUrl } from '@/utils/imageUtils'
import type { UserData } from '@/types/user'

export default function Login() {
  const router = useRouter()
  const [userCode, setUserCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const uteliasUrl = getFullImageUrl('utelias.PNG', 'common')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userCode.trim()) {
      setError('Anna koodi')
      return
    }

    setIsLoading(true)
    try {
      const usersRef = collection(db, 'kayttajat')
      const q = query(usersRef, where('Koodi', '==', userCode))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('Virheellinen koodi')
        setIsLoading(false)
        return
      }

      const userData = querySnapshot.docs[0].data() as UserData

      if (userData.Access !== 'TRUE') {
        setError('Ei käyttöoikeutta')
        setIsLoading(false)
        return
      }

      // Tallennetaan IndexedDB:hen
      if ('indexedDB' in window) {
        const dbRequest = window.indexedDB.open('KielinuppuDB', 1)
        
        dbRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains('auth')) {
            db.createObjectStore('auth')
          }
        }

        dbRequest.onsuccess = (event: Event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(['auth'], 'readwrite')
          const store = transaction.objectStore('auth')

          store.put(userData, 'userData')
          store.put(userCode, 'userCode')
        }

        dbRequest.onerror = () => {
          console.error("IndexedDB error")
        }
      }

      // Tallennetaan myös localStorage ja cookie
      localStorage.setItem('userCode', userCode)
      localStorage.setItem('userData', JSON.stringify(userData))
      
      const oneYear = 365 * 24 * 60 * 60 * 1000
      const expires = new Date(Date.now() + oneYear)
      document.cookie = `userData=${JSON.stringify(userData)}; path=/; expires=${expires.toUTCString()}; secure; SameSite=Strict`

      router.push('/home')

    } catch (error) {
      console.error('Login error:', error)
      setError('Kirjautumisvirhe')
    } finally {
      setIsLoading(false)
    }
  }

 return (
   <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center pt-2">
     <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
       <ArrowLeft 
         className="cursor-pointer" 
         size={45} 
         strokeWidth={3}
         onClick={() => router.push('/')}
       />
     </div>
     
     <div className="flex flex-col items-center justify-center flex-1 -mt-20 w-full">
       <h1 className="text-5xl font-semibold mb-12 text-center">
         KIRJAUDU SISÄÄN
       </h1>
       <form onSubmit={handleLogin} className="flex flex-col items-center w-full">
         <input
           type="text"
           placeholder="ANNA KOODI"
           value={userCode}
           onChange={(e) => {
             setUserCode(e.target.value.toUpperCase())
             setError('')
           }}
           disabled={isLoading}
           className="bg-white w-80 px-6 py-3 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] mb-8 placeholder-gray-400"
         />
         {error && (
           <p className="text-red-500 mb-4">{error}</p>
         )}
         <button 
           type="submit"
           disabled={isLoading}
           className={`bg-[#f6f7e7] px-6 py-3 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:shadow-md w-80 mb-8 
             ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
         >
           {isLoading ? 'KIRJAUDUTAAN...' : 'KIRJAUDU'}
         </button>
       </form>
       <div>
         {uteliasUrl && (
           <QuickImage
             src={uteliasUrl}
             alt="Utelias nalle"
             width={350}
             height={350}
             priority={true}
             className="w-[350px] h-[350px] object-contain"
           />
         )}
       </div>
     </div>
   </div>
 )
}