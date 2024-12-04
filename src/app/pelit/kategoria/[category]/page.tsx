'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import Image from 'next/image'
import Link from 'next/link' 

function parseImageData(jsonString: string) {
  try {
    const fixedString = jsonString.replace(/'/g, '"')
    return JSON.parse(fixedString)
  } catch {
    return null
  }
}

interface Peli {
  ID: number;
  Name: string;
  'mikä pelilaji': number;
  Laulut: string;
  'Pelin osoite': string;
}

const categoryTitles: { [key: string]: string } = {
  'laulupelit': 'LAULUPELIT',
  'sanapelit': 'SANAPELIT',
  'valintapelit': 'VALINTAPELIT',
  'muistipelit': 'MUISTIPELIT',
  'muut': 'MUUT'
}

const pelilajiNumbers: { [key: string]: number } = {
  'muistipelit': 1,
  'valintapelit': 2,
  'laulupelit': 3,
  'sanapelit': 4
}

export default function PeliKategoriaPage({
  params
}: {
  params: Promise<{ category: string }>
}) {
  const router = useRouter()
  const [pelit, setPelit] = useState<Peli[]>([])
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<{[key: number]: string}>({})
  
  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      if (resolvedParams && resolvedParams.category) {
        setCurrentCategory(resolvedParams.category)
      }
    }

    unwrapParams();
  }, [params]);

  useEffect(() => {
    async function fetchPelit() {
      if (!currentCategory) return;
      
      const pelilajiNumber = pelilajiNumbers[currentCategory]
      if (!pelilajiNumber) return;

      try {
        const pelitRef = collection(db, 'pelit')
        const q = query(pelitRef, where('mikä pelilaji', '==', pelilajiNumber))
        const querySnapshot = await getDocs(q)
        const pelitData = querySnapshot.docs.map(doc => ({
          ...doc.data()
        })) as Peli[]
        
        const sortedPelit = pelitData.sort((a, b) => b.ID - a.ID)
        setPelit(sortedPelit)

        for (const peli of sortedPelit) {
          try {
            const laulutRef = collection(db, 'laulut')
            const lauluQuery = query(laulutRef, where('Name', '==', peli.Laulut))
            const lauluSnapshot = await getDocs(lauluQuery)
            
            if (!lauluSnapshot.empty) {
              const laulu = lauluSnapshot.docs[0].data()
              const imageData = parseImageData(laulu['Laulun kuvake'])
              if (imageData?.filename) {
                const imageRef = ref(storage, `images/laulut/${imageData.filename}`)
                const url = await getDownloadURL(imageRef)
                setImageUrls(prev => ({ ...prev, [peli.ID]: url }))
              }
            }
          } catch (error) {
            console.error('Error fetching image for game:', error)
          }
        }
      } catch (error) {
        console.error('Error fetching games:', error)
      }
    }

    fetchPelit()
  }, [currentCategory])

  const categoryTitle = currentCategory ? categoryTitles[currentCategory] : 'PELIT'

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/pelit')}
        />
        <h1 className="text-4xl font-semibold flex-1 text-center">
          {categoryTitle}
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
        {pelit.map((peli) => (
          <Link 
            key={peli.ID}
            href={`/pelit/peli/${encodeURIComponent(peli['Pelin osoite'])}`}
            className="bg-white rounded-lg w-full shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="flex items-center h-[75px]">
              <div className="ml-2 rounded-lg overflow-hidden" style={{ width: '75px', height: '75px' }}>
                {imageUrls[peli.ID] ? (
                  <Image
                    src={imageUrls[peli.ID]}
                    alt={peli.Laulut}
                    width={82}
                    height={65}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded" />
                  </div>
                )}
              </div>
              <span className="ml-4 text-lg text-gray-600">{peli.Laulut}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}