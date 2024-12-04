'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

// Siirretään parseImageData funktion määrittely komponentin ulkopuolelle
function parseImageData(jsonString: string) {
  try {
    const fixedString = jsonString.replace(/'/g, '"')
    return JSON.parse(fixedString)
  } catch {
    return null
  }
}

interface Laulu {
  id: string;
  Name: string;
  'Laulun kuvake': string;
  Aiheet: string;
}

export default function LaulutPage({
  params
}: {
  params: Promise<{ aiheId: string }>
}) {
  const router = useRouter()
  const [aiheNimi, setAiheNimi] = useState("")
  const [laulut, setLaulut] = useState<Laulu[]>([])
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({})

  const [currentAiheId, setCurrentAiheId] = useState<string | null>(null)

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      if (resolvedParams && resolvedParams.aiheId) {
        setCurrentAiheId(resolvedParams.aiheId)
      }
    }

    unwrapParams();
  }, [params]);

  useEffect(() => {
    async function fetchData() {
      try {
        const aiheDoc = await getDocs(collection(db, 'aiheet'))
        const aihe = aiheDoc.docs.find(doc => doc.id === currentAiheId)
        if (aihe) {
          const aiheData = aihe.data()
          setAiheNimi(aiheData.Name)
  
          const laulutSnapshot = await getDocs(collection(db, 'laulut'))
          const allLaulut = laulutSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Laulu[]
  
          const aiheenLaulut = allLaulut
            .filter(laulu => laulu.Aiheet === aiheData.Name)
            .sort((a, b) => a.Name.localeCompare(b.Name))
  
          setLaulut(aiheenLaulut)
  
          for (const laulu of aiheenLaulut) {
            try {
              const imageData = parseImageData(laulu['Laulun kuvake'])
              if (imageData?.filename) {
                const imageRef = ref(storage, `images/laulut/${imageData.filename}`)
                const url = await getDownloadURL(imageRef)
                setImageUrls(prev => ({ ...prev, [laulu.id]: url }))
              }
            } catch (error) {
              console.error('Image fetching error:', error)
            }
          }
        }
      } catch (error) {
        console.error('Fetching error:', error)
      }
    }
  
    if (currentAiheId) {
      fetchData()
    }
  }, [currentAiheId])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/aiheet')}
        />
        <h1 className="text-4xl font-semibold flex-1 text-center">
          {aiheNimi}
        </h1>
        <div className="w-[45px]"></div>
      </div>
  
      <div className="w-full max-w-[580px] mt-8">
        {laulut.map((laulu, index) => (
          <Link href={`/aiheet/${currentAiheId}/laulut/${laulu.id}`} key={laulu.id} className="block mb-3">
            <div className="flex items-center bg-white rounded-lg p-2 h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
              <div className="w-[77px] h-[77px] relative rounded-lg overflow-hidden ml-2">
                {imageUrls[laulu.id] ? (
                  <Image
                    src={imageUrls[laulu.id]}
                    alt={laulu.Name}
                    fill
                    priority={index < 4}
                    className="object-cover"
                    sizes="77px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                )}
              </div>
              <span className="ml-4 text-xl">{laulu.Name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}