'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

interface PDFData {
  filename: string
  size: number
  url: string
}

interface KoulutusSisalto {
  id: string
  Name: string
  Koulutusmateriaali: string
  jarjestysnum: number
  Video?: string
  PDF?: PDFData
}

export default function KoulutusSisaltoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [otsikko, setOtsikko] = useState("")
  const [sisallot, setSisallot] = useState<KoulutusSisalto[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params
      setCurrentId(resolvedParams.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    const fetchData = async () => {
      if (!currentId) return

      try {
        const materiaaliDoc = doc(db, 'kielinuppu-koulutusmateriaali', currentId)
        const materiaaliSnap = await getDoc(materiaaliDoc)
        
        if (materiaaliSnap.exists()) {
          const materiaaliName = materiaaliSnap.data().Name
          setOtsikko(materiaaliName)

          const sisaltoRef = collection(db, 'kielinuppu-koulutussisalto')
          const sisaltoSnap = await getDocs(sisaltoRef)
          
          const sisaltoList = sisaltoSnap.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              Name: doc.data().Name || '',
              Koulutusmateriaali: doc.data().Koulutusmateriaali || '',
              jarjestysnum: doc.data().jarjestysnum || 0,
              Video: doc.data().Video || '',
              PDF: doc.data().PDF || null
            }))
            .filter(doc => doc.Koulutusmateriaali === materiaaliName)
            .sort((a, b) => a.jarjestysnum - b.jarjestysnum) as KoulutusSisalto[]

          setSisallot(sisaltoList)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [currentId])

  const handleContentClick = async (sisalto: KoulutusSisalto) => {
    if (sisalto.Video) {
      router.push(`/viewer?url=${encodeURIComponent(sisalto.Video)}&type=video`)
    } else if (sisalto.PDF?.filename) {
      // Käytetään suoraan filename-kenttää storagesta hakemiseen
      router.push(`/viewer?title=${encodeURIComponent(sisalto.Name)}&url=${encodeURIComponent(`pdf/${sisalto.PDF.filename}`)}&type=pdf`)
    }
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer ml-3 sm:ml-4" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/koulutus')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center truncate">
          {otsikko}
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[580px] mt-4 sm:mt-8">
        {sisallot.length === 0 ? (
          <div className="text-center text-[14px] lg:text-[20px]">Loading...</div>
        ) : (
          sisallot.map((sisalto) => (
            <div
              key={sisalto.id}
              onClick={() => handleContentClick(sisalto)}
              className="mb-2 sm:mb-3 cursor-pointer"
            >
              <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
                <span className="text-[14px] lg:text-[20px] flex-1 text-center truncate px-2">
                  {sisalto.Name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
)
}