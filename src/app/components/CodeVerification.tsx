'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default function CodeVerification() {
  const router = useRouter()
  
  useEffect(() => {
    // Tarkistetaan onko jo tarkistettu tässä selainistunnossa
    const hasVerified = sessionStorage.getItem('codeVerified')
    if (hasVerified) return
    
    const verifyCode = async () => {
      try {
        const userCode = localStorage.getItem('userCode')
        if (!userCode) return
        
        const usersRef = collection(db, 'kayttajat')
        const q = query(usersRef, where('Koodi', '==', userCode))
        const querySnapshot = await getDocs(q)
        
        // Jos koodi ei ole enää voimassa
        if (querySnapshot.empty || querySnapshot.docs[0].data().Access !== 'TRUE') {
          localStorage.removeItem('userCode')
          localStorage.removeItem('userData')
          document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          router.push('/login')
          return
        }
        
        // Merkitään tarkistetuksi
        sessionStorage.setItem('codeVerified', 'true')
      } catch (error) {
        console.error('Auth verification error:', error)
      }
    }
    
    verifyCode()
  }, [router])
  
  return null
}