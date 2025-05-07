'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { getFullImageUrl } from '@/utils/imageUtils'

interface Muskari {
  ID: number
  Name: string
  osoite: string
  'järj num': number
  'New Property': string
  id: string
  imageUrl: string | null
}

// Tämä funktio käsittelee sekä JSON-objektit että pelkät tiedostonimet
function getImageUrl(newProperty: string | undefined): string | null {
  if (!newProperty) return null;
  
  // JSON-objektin käsittely
  if (newProperty.startsWith('{') && newProperty.includes('filename')) {
    try {
      const fixedJson = newProperty.replace(/'/g, '"');
      const parsed = JSON.parse(fixedJson);
      
      if (parsed.filename) {
        return getFullImageUrl(parsed.filename, 'muskarit');
      }
      else if (parsed.url) {
        return parsed.url;
      }
    } catch (e) {
      console.error("JSON-jäsennysvirhe:", e);
    }
  }
  
  // Suoran tiedostonimen käsittely
  else if (newProperty.endsWith('.png') || 
           newProperty.endsWith('.jpg') || 
           newProperty.endsWith('.jpeg')) {
    return getFullImageUrl(newProperty, 'muskarit');
  }
  
  return null;
}

export default function MuskaritPage() {
  const router = useRouter()
  const [muskarit, setMuskarit] = useState<Muskari[]>([])
  const [materiaalit, setMateriaalit] = useState<Muskari[]>([])

  useEffect(() => {
    const fetchMuskarit = async () => {
      try {
        const muskaritCol = collection(db, 'muskarit')
        const muskaritSnapshot = await getDocs(muskaritCol)
        const muskaritList = muskaritSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            imageUrl: getImageUrl(data['New Property'])
          }
        }) as Muskari[]

        // Erottele materiaalit ja muskarit
        const materiaalitData = muskaritList.filter(m => m['järj num'] === 1)
        const muskaritData = muskaritList
          .filter(m => m['järj num'] !== 1)
          .sort((a, b) => a['järj num'] - b['järj num'])

        setMateriaalit(materiaalitData)
        setMuskarit(muskaritData)
      } catch (error) {
        console.error('Virhe muskareiden haussa:', error)
      }
    }

    fetchMuskarit()
  }, [])

  const handleMuskariClick = (muskari: Muskari) => {
    const params = new URLSearchParams({
      url: muskari.osoite,
      type: 'video'
    })
    router.push(`/viewer?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex justify-between px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={42} 
          strokeWidth={2}
          onClick={() => router.push('/home')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center truncate">
          MUSKARIT
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[580px] mt-4 sm:mt-8">
        
        {materiaalit.map((materiaali) => (
          <Link 
            key={materiaali.ID}
            href="/muskarit/muskaritulosteet"
            className="block mb-4 sm:mb-5"
          >
            <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
              <span className="text-[14px] lg:text-[20px] flex-1 text-center truncate">
                {materiaali.Name}
              </span>
            </div>
          </Link>
        ))}

        {/* Muskarivideot */}
        {muskarit.map((muskari, index) => (
          <div
            key={muskari.ID}
            onClick={() => handleMuskariClick(muskari)}
            className="mb-2 sm:mb-3 cursor-pointer"
          >
            <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
              <div className="ml-[10px] w-[65px] h-[65px] sm:w-[77px] sm:h-[77px] relative rounded-lg overflow-hidden">
                {muskari.imageUrl ? (
                  <QuickImage
                    src={muskari.imageUrl}
                    alt={muskari.Name}
                    fill
                    priority={index < 4}
                    className="object-cover"
                    sizes="(max-width: 640px) 65px, 77px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                )}
              </div>
              <span className="ml-[1px] text-[14px] lg:text-[20px] truncate max-w-[calc(100%-90px)]">
                {muskari.Name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}