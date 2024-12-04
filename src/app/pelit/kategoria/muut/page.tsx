'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

interface Bingo {
  id: string;
  ID: number;
  Name: string;
  kuva: {
    filename: string;
  };
  peliosoite: string;
}

export default function MuutPage() {
  const router = useRouter()
  const [bingos, setBingos] = useState<Bingo[]>([])
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({})

  useEffect(() => {
    async function fetchBingos() {
      try {
        const bingotRef = collection(db, 'bingot')
        const querySnapshot = await getDocs(bingotRef)

        const bingoData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bingo[]

        // Järjestä nimen mukaan
        const sortedBingos = bingoData.sort((a, b) => a.Name.localeCompare(b.Name))
        setBingos(sortedBingos)

        // Hae kuvat Storagesta
        for (const bingo of sortedBingos) {
          if (bingo.kuva?.filename) {
            try {
              // Lisää "(1)" tiedostonimeen ennen päätettä
              const filename = bingo.kuva.filename.replace(/(\.[^.]+)$/, ' (1)$1')
              const imageRef = ref(storage, `images/bingot/${filename}`)
              const url = await getDownloadURL(imageRef)
              setImageUrls(prev => ({...prev, [bingo.id]: url}))
            } catch (error) {
              console.error('Virhe kuvan haussa:', error)
            }
          }
        }
      } catch (error) {
        console.error('Virhe bingojen haussa:', error)
      }
    }

    fetchBingos()
  }, [])

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
          MUUT
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[500px] mt-8">
        {bingos.map((bingo) => (
          <Link 
            key={bingo.id}
            href={`/pelit/kategoria/muut/bingosivu?id=${bingo.id}`} 
            className="bg-white rounded-lg w-full shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform cursor-pointer block mb-3"
          >
            <div className="flex items-center h-[75px]">
              <div className="ml-4 rounded-lg overflow-hidden" style={{ width: '75px', height: '75px' }}>
                {imageUrls[bingo.id] ? (
                  <Image
                    src={imageUrls[bingo.id]}
                    alt={bingo.Name}
                    width={75}
                    height={75}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded" />
                  </div>
                )}
              </div>
              <span className="ml-6 text-xl text-gray-600">{bingo.Name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}