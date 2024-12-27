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

      try {
        localStorage.setItem('userCode', userCode)
        localStorage.setItem('userData', JSON.stringify(userData))
        
        const oneYear = 365 * 24 * 60 * 60 * 1000
        const expires = new Date(Date.now() + oneYear)
        document.cookie = `userData=${JSON.stringify(userData)}; path=/; expires=${expires.toUTCString()}; secure; SameSite=Strict`

      } catch (storageError) {
        console.error('Storage error:', storageError)
        setError('Kirjautumistietojen tallennus epäonnistui')
        return
      }

      router.push('/home')

    } catch (error) {
      console.error('Login error:', error)
      setError('Kirjautumisvirhe')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col">
      
      <div className="hidden md:block absolute left-6 top-2 z-20">
        <ArrowLeft 
          className="cursor-pointer w-[45px]"  
          strokeWidth={2}
          onClick={() => router.push('/')}
        />
      </div>

      
      <div className="sticky md:hidden top-0 w-full flex px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer w-[40px] sm:w-[42px]"  
          strokeWidth={2}
          onClick={() => router.push('/')}
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4">
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