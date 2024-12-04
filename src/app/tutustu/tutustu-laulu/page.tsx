'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

interface Laulu {
  id: string;
  Name: string;
  'Laulun kuvake': string;
  Aiheet: string;
}

const parseImageData = (jsonString: string) => {
  try {
    const fixedString = jsonString.replace(/'/g, '"')
    return JSON.parse(fixedString)
  } catch {
    return null
  }
}

export default function TutustuLauluPage() {
  const router = useRouter()
  const [laulut, setLaulut] = useState<Laulu[]>([])
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const laulutSnapshot = await getDocs(collection(db, 'laulut'))
        const allLaulut = laulutSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Laulu[]

        const aiheenLaulut = allLaulut
          .filter(laulu => laulu.Aiheet === "ARJEN TAIDOT")
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
      } catch (error) {
        console.error('Fetching error:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/tutustu/tutustu-aihe')}
        />
        <h1 className="text-4xl font-semibold flex-1 text-center">
          ARJEN TAIDOT
        </h1>
        <div className="w-[45px]"></div>
      </div>
  
      <div className="w-full max-w-[580px] mt-8">
        {laulut.map((laulu, index) => (
          <div 
            key={laulu.id} 
            className="block mb-3"
            onClick={() => laulu.Name === "PUETAAN" ? router.push(`/aiheet/10/laulut/48`) : null}
          >
            <div className={`flex items-center bg-white rounded-lg p-2 h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] ${laulu.Name !== "PUETAAN" ? "opacity-40" : "cursor-pointer hover:scale-[1.02] transition-transform"}`}>
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
          </div>
        ))}
      </div>
    </div>
  )
}