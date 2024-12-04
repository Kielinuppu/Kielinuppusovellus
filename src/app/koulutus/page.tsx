'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import Link from 'next/link'

interface KoulutusMateriaali {
  id: string
  Name: string
}

export default function KoulutusPage() {
  const router = useRouter()
  const [materiaalit, setMateriaalit] = useState<KoulutusMateriaali[]>([])

  useEffect(() => {
    const fetchKoulutukset = async () => {
      try {
        console.log('Fetching from collection:', 'kielinuppu-koulutusmateriaali')
        const collectionRef = collection(db, 'kielinuppu-koulutusmateriaali')
        const snapshot = await getDocs(collectionRef)
        
        console.log('Raw docs:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        
        const koulutusList = snapshot.docs.map(doc => ({
          id: doc.id,
          Name: doc.data().Name || ''
        }))
        
        setMateriaalit(koulutusList)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchKoulutukset()
  }, [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/home')}
        />
        <h1 className="text-4xl font-semibold flex-1 text-center">
          KOULUTUKSET
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[580px] mt-8">
        {materiaalit.length === 0 ? (
          <div className="text-center">Loading...</div>
        ) : (
          materiaalit.map((materiaali) => (
            <Link 
              href={`/koulutus/${materiaali.id}`} 
              key={materiaali.id}
              className="block mb-3"
            >
              <div className="flex items-center bg-white rounded-lg p-4 h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
                <span className="text-xl flex-1 text-center">{materiaali.Name}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}