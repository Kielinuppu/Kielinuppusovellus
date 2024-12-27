'use client'

import { ImageData } from '@/types/image'
import { useEffect, useState } from 'react'
import QuickImage from '@/components/QuickImage'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getFullImageUrl } from '@/utils/imageUtils'
import { parseImageData } from '@/types/image'

interface Laulu {
  id: string;
  Name: string;
  'Laulun kuvake': string;
  Aiheet: string;
  parsedImage?: ImageData;
}

export default function TutustuLauluPage() {
  const router = useRouter()
  const [laulut, setLaulut] = useState<Laulu[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const laulutSnapshot = await getDocs(collection(db, 'laulut'))
        const allLaulut = laulutSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          parsedImage: parseImageData(doc.data()['Laulun kuvake'])
        })) as Laulu[]

        const aiheenLaulut = allLaulut
          .filter(laulu => laulu.Aiheet === "ARJEN TAIDOT")
          .sort((a, b) => a.Name.localeCompare(b.Name))

        setLaulut(aiheenLaulut)
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
          className="cursor-pointer w-[40px] sm:w-[42px] md:w-[45px]" 
          strokeWidth={2}
          onClick={() => router.push('/tutustu/tutustu-aihe')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center">
          ARJEN TAIDOT
        </h1>
        <div className="w-[35px] sm:w-[40px] md:w-[45px]"></div>
      </div>

      <div className="w-full max-w-[580px] mt-4 sm:mt-2">
        {laulut.map((laulu, index) => (
          <div 
            key={laulu.id} 
            className="block mb-2 sm:mb-3"
            onClick={() => laulu.Name === "PUETAAN" ? router.push(`/aiheet/10/laulut/48`) : null}
          >
            <div className={`flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] ${
              laulu.Name !== "PUETAAN" ? "opacity-40" : "cursor-pointer hover:scale-[1.02] transition-transform"
            }`}>
              <div className="w-[65px] h-[65px] sm:w-[77px] sm:h-[77px] relative rounded-lg overflow-hidden ml-2">
                {laulu.parsedImage ? (
                  <QuickImage
                    src={getFullImageUrl(laulu.parsedImage.filename, 'laulut')}
                    alt={laulu.Name}
                    fill
                    priority={index < 4}
                    className="object-cover"
                    sizes="(max-width: 640px) 65px, 77px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                )}
              </div>
              <span className="ml-1 sm:ml-1 text-[15px] sm:text-lg md:text-xl truncate max-w-[calc(100%-90px)]">
                {laulu.Name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}