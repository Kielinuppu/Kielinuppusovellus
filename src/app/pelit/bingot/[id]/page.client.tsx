'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'

interface Bingo {
  ID: number;
  Name: string;
  peliosoite: string;
  pelialustat: {
    url: string;
  };
  'osoite vai ei': number;
}

export default function BingoPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [bingo, setBingo] = useState<Bingo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBingo() {
      if (!params?.id) {
        setLoading(false)
        return
      }

      try {
        const docId = '2' // Käytetään suoraan dokumentin ID:tä
        const bingoRef = doc(db, 'bingot', docId)
        const bingoSnap = await getDoc(bingoRef)
        
        if (bingoSnap.exists()) {
          const data = bingoSnap.data()
          setBingo(data as Bingo)
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Virhe bingon haussa:', error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBingo()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
        <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
          <ArrowLeft 
            className="cursor-pointer" 
            size={42} 
            strokeWidth={2}
            onClick={() => router.back()}
          />
          <h1 className="text-4xl font-semibold flex-1 text-center">
            Ladataan...
          </h1>
          <div className="w-[45px]"></div>
        </div>
      </div>
    )
  }

  if (!bingo) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
        <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
          <ArrowLeft 
            className="cursor-pointer" 
            size={42} 
            strokeWidth={2}
            onClick={() => router.back()}
          />
          <h1 className="text-4xl font-semibold flex-1 text-center">
            Bingoa ei löytynyt
          </h1>
          <div className="w-[45px]"></div>
        </div>
      </div>
    )
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
        <h1 className="text-4xl font-semibold flex-1 text-center">
          {bingo.Name}
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[500px] mt-8 flex flex-col gap-4">
        {bingo['osoite vai ei'] === 1 && (
          <Link
            href={bingo.peliosoite}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg w-full h-[75px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center"
          >
            <span className="text-xl text-gray-600">ARVONTAKONE</span>
          </Link>
        )}
        
        <Link
          href={bingo.pelialustat.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-lg w-full h-[75px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center"
        >
          <span className="text-xl text-gray-600">TULOSTETTAVAT PELIALUSTAT</span>
        </Link>
      </div>
    </div>
  )
}