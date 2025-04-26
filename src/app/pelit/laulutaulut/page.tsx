'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { getFullImageUrl } from '@/utils/imageUtils'
import InfoButton from '@/components/InfoButton' // Lisätty import

interface LauluTaulu {
  id: string;
  ID: number;
  Name: string;
  kuva: string;
  järjestysnumero: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  luontiaika: any;
  pelin_osoite: string;
}

export default function LaulutaulutPage() {
  const router = useRouter()
  const [laulutaulut, setLaulutaulut] = useState<LauluTaulu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLaulutaulut() {
      try {
        setLoading(true)
        const laulutaulutRef = collection(db, 'laulutaulut')
        const querySnapshot = await getDocs(laulutaulutRef)

        const laulutaulutData = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ID: data.ID || 0,
            Name: data.Name || '',
            kuva: data.kuva || '',
            järjestysnumero: data.järjestysnumero || 0,
            luontiaika: data.luontiaika,
            pelin_osoite: data['pelin osoite'] || data.pelin_osoite || ''
          }
        }) as LauluTaulu[]

        // Järjestä laulutaulut järjestysnumeron mukaan
        const sortedLaulutaulut = laulutaulutData.sort((a, b) => a.järjestysnumero - b.järjestysnumero)
        setLaulutaulut(sortedLaulutaulut)
      } catch (error) {
        console.error('Virhe laulutaulujen haussa:', error)
        setError('Virhe laulutaulujen haussa')
      } finally {
        setLoading(false)
      }
    }

    fetchLaulutaulut()
  }, [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={42} 
          strokeWidth={2}
          onClick={() => router.push('/pelit')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center">
          LAULUTAULUT
        </h1>
        <InfoButton 
          category="laulutaulut" 
          page="laulutaulut"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Ladataan...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      ) : (
        <div className="w-full max-w-[580px] mt-4 sm:mt-8">
          {laulutaulut.map((laulutaulu, index) => (
            <Link 
              key={laulutaulu.id}
              href={`/pelit/laulutaulut/${encodeURIComponent(laulutaulu.id)}`}
              className="block mb-2 sm:mb-3"
            >
              <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
                <div className="w-[65px] h-[65px] sm:w-[77px] sm:h-[77px] relative rounded-lg overflow-hidden ml-2">
                  {laulutaulu.kuva ? (
                    <QuickImage
                      src={getFullImageUrl(laulutaulu.kuva, 'common')}
                      alt={laulutaulu.Name}
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
                  {laulutaulu.Name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}