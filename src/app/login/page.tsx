'use client'

import QuickImage from '@/components/QuickImage'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getFullImageUrl } from '@/utils/imageUtils'

export default function Login() {
  const router = useRouter()
  const [userCode, setUserCode] = useState('')
  const [error, setError] = useState('')
  const uteliasUrl = getFullImageUrl('utelias.PNG', 'common')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userCode.trim()) {
      setError('Anna koodi')
      return
    }

    try {
      const usersRef = collection(db, 'kayttajat')
      const q = query(usersRef, where('Koodi', '==', userCode))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('Virheellinen koodi')
        return
      }

      const userData = querySnapshot.docs[0].data()

      if (userData.Access !== 'TRUE') {
        setError('Ei käyttöoikeutta')
        return
      }

      localStorage.setItem('userCode', userCode)
      localStorage.setItem('userData', JSON.stringify(userData))
      document.cookie = `userData=${JSON.stringify(userData)}; path=/`
      
      router.push('/home')

    } catch (error) {
      console.error('Login error:', error)
      setError('Kirjautumisvirhe')
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
      
      <div className="flex flex-col items-center justify-center flex-1 -mt-20">
        <h1 className="text-5xl font-semibold mb-12">KIRJAUDU SISÄÄN</h1>
        <form onSubmit={handleLogin} className="flex flex-col items-center w-full">
          <input
            type="text"
            placeholder="ANNA KOODI"
            value={userCode}
            onChange={(e) => {
              setUserCode(e.target.value.toUpperCase())
              setError('')
            }}
            className="bg-white w-80 px-6 py-3 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] mb-8 placeholder-gray-400"
          />
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          <button 
            type="submit"
            className="bg-[#f6f7e7] px-6 py-3 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:shadow-md w-80 mb-8"
          >
            KIRJAUDU
          </button>
        </form>
        <div>
          {uteliasUrl && (
            <QuickImage
            src={uteliasUrl}
            alt="Utelias nalle"
            width={350}
            height={350}
            priority={true}  // Lisätään tämä
            className="w-[350px] h-[350px] object-contain"
          />
          )}
        </div>
      </div>
    </div>
  )
}