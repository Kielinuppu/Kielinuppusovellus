'use client'

import { getFullImageUrl } from '@/utils/imageUtils'
import { Aihe, parseImageData } from '@/types/aihe'
import { useEffect, useState } from 'react'
import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'  // storage poistettu
import { collection, getDocs } from 'firebase/firestore'

export default function AiheListPage() {
  const router = useRouter()
  const [aiheet, setAiheet] = useState<Aihe[]>([])

  useEffect(() => {
    async function fetchAiheet() {
      try {
        const querySnapshot = await getDocs(collection(db, 'aiheet'))
        
        const aiheData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            parsedAiheKuva: parseImageData(data.aiheenkuva),
            parsedTutustuKuva: parseImageData(data['tutustu kuvat'])
          }
        }) as Aihe[];
        
        aiheData.sort((a, b) => a.Name.localeCompare(b.Name))
        setAiheet(aiheData)
      } catch (error) {
        console.error('Error fetching aiheet:', error)
      }
    }

    fetchAiheet()
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
          KATEGORIAT
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mt-8">
        {aiheet.map((aihe) => (
          <Link href={`/aiheet/${aihe.id}/laulut`} key={aihe.id}>
            <div className="w-[180px] h-[180px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] rounded-lg hover:scale-105 transition-transform">
              {aihe.parsedAiheKuva ? (
                <QuickImage
                src={getFullImageUrl(aihe.parsedAiheKuva.url, 'aiheet')}
                alt={aihe.Name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 180px, 180px"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}