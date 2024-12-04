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
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/koulutus')}
        />
        <h1 className="text-4xl font-semibold flex-1 text-center">
          {otsikko}
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[580px] mt-8">
        {sisallot.length === 0 ? (
          <div className="text-center">Loading...</div>
        ) : (
          sisallot.map((sisalto) => (
            <div
              key={sisalto.id}
              onClick={() => handleContentClick(sisalto)}
              className="mb-3 cursor-pointer"
            >
              <div className="flex items-center bg-white rounded-lg p-4 h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
                <span className="text-xl flex-1 text-center">{sisalto.Name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}