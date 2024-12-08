'use client'

import { Laulu, parseImageData } from '@/types/laulu'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { getFullImageUrl } from '@/utils/imageUtils'

export default function HakemistoPage() {
  const router = useRouter()
  const [laulut, setLaulut] = useState<Laulu[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [aiheet, setAiheet] = useState<{[key: string]: string}>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const aiheetSnapshot = await getDocs(collection(db, 'aiheet'))
        const aiheetMap: {[key: string]: string} = {}
        aiheetSnapshot.docs.forEach(doc => {
          aiheetMap[doc.data().Name] = doc.id
        })
        setAiheet(aiheetMap)

        const laulutSnapshot = await getDocs(collection(db, 'laulut'))
        const fetchedLaulut = laulutSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            parsedImage: parseImageData(data['Laulun kuvake'])
          };
        }) as Laulu[];
        
        const sortedLaulut = fetchedLaulut.sort((a, b) => 
          a.Name.localeCompare(b.Name, 'fi')
        )
        
        setLaulut(sortedLaulut)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const filteredLaulut = laulut.filter(laulu =>
    laulu.Name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/home')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center">
          HAKEMISTO
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[580px] mt-4 mb-6">
        <input
          type="text"
          placeholder="ETSI LAULUA"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] text-[14px] sm:text-lg"
        />
      </div>

      <div className="w-full max-w-[580px]">
        {filteredLaulut.map((laulu, index) => (
          <Link 
            href={`/aiheet/${aiheet[laulu.Aiheet]}/laulut/${laulu.id}`}
            key={laulu.id} 
            className="block mb-2 sm:mb-3"
          >
            <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
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
              <span className="ml-3 sm:ml-4 text-[14px] sm:text-lg md:text-xl truncate max-w-[calc(100%-90px)]">
                {laulu.Name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}