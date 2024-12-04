'use client'

import React, { use } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Volume2, Music } from 'lucide-react'
import Image from 'next/image'

interface AudioFileInfo {
  url: string;
  size: number;
  filename: string;
}

interface ImageFileInfo {
  url: string;
  size: number;
  filename: string;
  width: number;
  height: number;
  metadata?: {
    width: number;
    height: number;
    blurHash: string;
    blurHashWidth: number;
  };
}

interface Laulu {
  ID: number;
  Name: string;
  audio: string;        
  'audio instrumental': string;
  'Laulun kuvake': string;
}

export default function AudioLayout({
    children,
    params
  }: {
    children: React.ReactNode
    params: Promise<{ lauluId: string }>
  }) {

  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const [laulu, setLaulu] = useState<Laulu | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchLaulu = async () => {
      if (!resolvedParams.lauluId) return

      try {
        const lauluDoc = await getDoc(doc(db, 'laulut', resolvedParams.lauluId))
        
        if (!mounted) return
        
        if (!lauluDoc.exists()) {
          setError('Laulua ei löytynyt')
          return
        }

        const lauluData = lauluDoc.data() as Laulu
        setLaulu(lauluData)

        // Haetaan kuvan URL oikeasta polusta
        if (lauluData['Laulun kuvake']) {
          try {
            const imageInfo = JSON.parse(lauluData['Laulun kuvake'].replace(/'/g, '"')) as ImageFileInfo
            const storage = getStorage()
            // Korjattu polku: images/laulut/
            const imagePath = `images/laulut/${imageInfo.filename}`
            console.log('Haetaan kuvaa polusta:', imagePath)
            const imageRef = ref(storage, imagePath)
            const imageUrl = await getDownloadURL(imageRef)
            if (mounted) setImageUrl(imageUrl)
          } catch (error) {
            console.error('Virhe kuvan latauksessa:', error)
          }
        }

        // Audio URL:n haku jatkuu samana...
        const audioData = type === 'karaoke' ? lauluData['audio instrumental'] : lauluData.audio

        if (!audioData) {
          setError('Äänitiedostoa ei löytynyt')
          return
        }

        try {
          const audioInfo = JSON.parse(audioData.replace(/'/g, '"')) as AudioFileInfo
          const storage = getStorage()
          const fileName = audioInfo.filename
          const folderPath = type === 'karaoke' ? 'instrumental' : 'audio'
          const audioPath = `Laulut/${folderPath}/${fileName}`
          
          const audioRef = ref(storage, audioPath)
          const url = await getDownloadURL(audioRef)
          
          if (!mounted) return
          setAudioUrl(url)
        } catch (error) {
          console.error('Virhe audio URL:n haussa:', error)
          if (mounted) setError('Äänitiedoston lataus epäonnistui')
        }
      } catch (error) {
        console.error('Virhe:', error)
        if (mounted) setError('Virhe tietojen latauksessa')
      }
    }

    fetchLaulu()

    return () => {
      mounted = false
    }
  }, [resolvedParams.lauluId, type])

  return (
    <div className="bg-[#e9f1f3] min-h-screen p-4">
      <div className="mb-4">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.back()}
        />
      </div>

      <div className="max-w-md mx-auto">
        {error ? (
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-red-500 mb-4">
              {type === 'karaoke' ? <Music size={48} /> : <Volume2 size={48} />}
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow-lg">
            {imageUrl && (
              <div className="mb-4 relative aspect-square rounded-lg overflow-hidden">
                <Image 
                  src={imageUrl}
                  alt={laulu?.Name || 'Laulun kuva'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />
              </div>
            )}

            <h2 className="text-xl font-semibold mb-4 text-center">
              {laulu?.Name || ''} {type === 'karaoke' ? '(Karaoke)' : ''}
            </h2>
            
            {audioUrl && (
              <audio 
                controls 
                src={audioUrl}
                className="w-full"
                controlsList="nodownload"
              >
                Selaimesi ei tue audio-elementtiä
              </audio>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}