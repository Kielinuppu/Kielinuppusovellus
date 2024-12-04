'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'

interface Aihe {
  id: string;
  ID: number;
  Name: string;
  aiheenkuva: string;  
  'tutustu kuvat': string;  
  Created: string;
  Updated: string;
}

const parseImageData = (jsonString: string) => {
  try {
    const fixedString = jsonString.replace(/'/g, '"');
    return JSON.parse(fixedString);
  } catch (error) {
    console.error('Error parsing image data:', error);
    return null;
  }
}

export default function TutustuPage() {
  const router = useRouter()
  const [aiheet, setAiheet] = useState<Aihe[]>([])
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({})

  useEffect(() => {
    async function fetchAiheet() {
      try {
        const querySnapshot = await getDocs(collection(db, 'aiheet'))
        
        const aiheData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Aihe[]
        
        aiheData.sort((a, b) => a.Name.localeCompare(b.Name))
        setAiheet(aiheData)

        for (const aihe of aiheData) {
          const imageData = parseImageData(aihe['tutustu kuvat']);
          if (imageData?.filename) {
            try {
              const imageRef = ref(storage, `images/aiheet/${imageData.filename}`);
              const url = await getDownloadURL(imageRef);
              setImageUrls(prev => ({...prev, [aihe.id]: url}));
            } catch (error) {
              console.error('Error getting image URL:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching aiheet:', error);
      }
    }

    fetchAiheet()
  }, [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
      <ArrowLeft 
 className="cursor-pointer" 
 size={45} 
 strokeWidth={3}
 onClick={() => router.push('/tutustu')}
/>

        <h1 className="text-4xl font-semibold flex-1 text-center">
          KATEGORIAT
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mt-8">
        {aiheet.map((aihe) => (
          <div 
            key={aihe.id} 
            onClick={() => aihe.Name === "ARJEN TAIDOT" ? router.push('/tutustu/tutustu-laulu') : null}
            className="cursor-pointer"
          >
            <div className="w-[180px] h-[180px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] rounded-lg hover:scale-105 transition-transform">
              {imageUrls[aihe.id] && (
                <Image
                  src={imageUrls[aihe.id]}
                  alt={aihe.Name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 180px, 180px"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}