'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import Link from 'next/link'
import QuickImage from '@/components/QuickImage'
import { getFullImageUrl } from '@/utils/imageUtils'
import { BingoData, parseBingoImage } from '@/types/bingo'
import InfoButton from '@/components/InfoButton' // Lisätty import

interface Peli {
  id: string
  ID: number
  Name: string
  kuva: BingoData | null
  laji: number
  pelialustat?: {
    filename: string
  }
}

const categoryNames = {
  'bingot': 'BINGOT',
  'nopat': 'NOPAT',
  'lautapelit': 'LAUTAPELIT'
}

export default function MuusisaltoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pelit, setPelit] = useState<Peli[]>([])
  const category = searchParams.get('laji') || 'bingot'
  const categoryNumber = category === 'bingot' ? 1 : category === 'nopat' ? 2 : 3

  useEffect(() => {
    async function fetchPelit() {
      try {
        const pelitRef = collection(db, 'bingot')
        const q = query(pelitRef, where('laji', '==', categoryNumber))
        const querySnapshot = await getDocs(q)

        const pelitData = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            kuva: parseBingoImage(data.kuva)
          }
        }) as Peli[]

        const sortedPelit = pelitData.sort((a, b) => a.Name.localeCompare(b.Name))
        setPelit(sortedPelit)
      } catch (error) {
        console.error('Virhe pelien haussa:', error)
      }
    }

    fetchPelit()
  }, [categoryNumber])

  const getItemLink = (peli: Peli) => {
    // Jos kyseessä on bingo (laji 1), ohjataan bingosivulle
    if (peli.laji === 1) {
      return `/pelit/kategoria/muut/muusisalto/bingosivu?id=${peli.id}`
    } 
    
    // Muille kategorioille (nopat ja lautapelit) suora ohjaus viewer-sivulle
    if (peli.pelialustat?.filename) {
      return `/viewer?type=pdf&url=${encodeURIComponent(`pdf/${peli.pelialustat.filename}`)}&title=${encodeURIComponent(peli.Name)}`
    }
    
    // Fallback jos tiedostoa ei löydy
    return '#'
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={42} 
          strokeWidth={2}
          onClick={() => router.back()}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center">
          {categoryNames[category as keyof typeof categoryNames]}
        </h1>
        
        {/* Lisätty InfoButton */}
        <InfoButton 
          category={category} 
          page="muusisalto"
        />
      </div>

      <div className="w-full max-w-[580px] mt-4 sm:mt-8">
        {pelit.map((peli, index) => (
          <Link 
            key={peli.id}
            href={getItemLink(peli)} 
            className="block mb-2 sm:mb-3"
          >
            <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
              <div className="w-[65px] h-[65px] sm:w-[77px] sm:h-[77px] relative rounded-lg overflow-hidden ml-2">
                {peli.kuva ? (
                  <QuickImage
                    src={getFullImageUrl(peli.kuva.filename, 'bingot')}
                    alt={peli.Name}
                    fill
                    priority={index < 4}
                    className="object-cover"
                    sizes="(max-width: 640px) 65px, 77px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
                )}
              </div>
              <span className="ml-1 sm:ml-4 text-[14px] lg:text-[20px] truncate max-w-[calc(100%-90px)]">
                {peli.Name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}