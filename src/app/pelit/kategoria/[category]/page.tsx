'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { getFullImageUrl } from '@/utils/imageUtils'
import { parseImageData } from '@/types/image'
import { ImageData } from '@/types/image'

interface Peli {
  ID: number;
  Name: string;
  'mikä pelilaji': number;
  Laulut: string;
  'Pelin osoite': string;
  parsedImage?: ImageData; // Muutettu any -> ImageData
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
        
        const pelitPromises = querySnapshot.docs.map(async doc => {
          const peliData = doc.data();
          
          const laulutRef = collection(db, 'laulut')
          const lauluQuery = query(laulutRef, where('Name', '==', peliData.Laulut))
          const lauluSnapshot = await getDocs(lauluQuery)
          
          if (!lauluSnapshot.empty) {
            const laulu = lauluSnapshot.docs[0].data()
            const imageData = parseImageData(laulu['Laulun kuvake'])
            return {
              ...peliData,
              parsedImage: imageData
            }
          }
          return peliData;
        });

        const pelitData = await Promise.all(pelitPromises)
        const sortedPelit = pelitData.sort((a, b) => a.Laulut.localeCompare(b.Laulut))
        setPelit(sortedPelit as Peli[])
      } catch (error) {
        console.error('Error fetching games:', error)
      }
    }

    fetchPelit()
  }, [currentCategory])

  const categoryTitle = currentCategory ? categoryTitles[currentCategory] : 'PELIT'

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex justify-between px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/pelit')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center truncate">
          {categoryTitle}
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
  {pelit.map((peli, index) => (
    <Link 
      key={peli.ID}
      href={`/pelit/peli/${encodeURIComponent(peli['Pelin osoite'])}`}
      className="bg-white rounded-lg w-full shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform cursor-pointer"
    >
      <div className="flex items-center h-[75px]">
  <div className="relative rounded-lg overflow-hidden ml-[10px]" style={{ width: '75px', height: '75px' }}>
    {peli.parsedImage ? (
      <QuickImage
        src={getFullImageUrl(peli.parsedImage.filename, 'laulut')}
        alt={peli.Laulut}
        fill
        priority={index < 4}
        className="object-cover"
        sizes="75px"
      />
    ) : (
      <div className="w-full h-full bg-gray-200 animate-pulse" />
    )}
  </div>
  <span className="ml-1 text-[14px] lg:text-[20px] truncate max-w-[calc(100%-95px)]">
    {peli.Laulut}
  </span>
</div>
    </Link>
  ))}
</div>
    </div>
  )
}