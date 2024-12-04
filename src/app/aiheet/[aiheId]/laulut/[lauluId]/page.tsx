'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'

type PageProps = {
  params: Promise<{
    aiheId: string;
    lauluId: string;
  }>
}

interface Laulu {
  ID: number;
  Name: string;
  'Video url': string;
}

interface Tekeminen {
  ID: number;
  Name: string;
  'Pelin osoite': string;
  TYYLI: string;
  tunnusluku: number;
  Lauluts: string[];
}

export default function LauluPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [laulu, setLaulu] = useState<Laulu | null>(null)
  const [tekemiset, setTekemiset] = useState<Tekeminen[]>([])

  useEffect(() => {
    async function fetchLaulu() {
      try {
        const lauluDoc = await getDoc(doc(db, 'laulut', resolvedParams.lauluId))
        if (lauluDoc.exists()) {
          setLaulu(lauluDoc.data() as Laulu)
        }
      } catch (error) {
        console.error('Error fetching laulu:', error)
      }
    }

    fetchLaulu()
  }, [resolvedParams.lauluId])

  useEffect(() => {
    async function fetchTekemiset() {
      if (!laulu?.ID) return;
      
      try {
        const tekemisetCollection = await getDocs(collection(db, 'tekeminen'));
        
        const laulunTekemiset = tekemisetCollection.docs
          .map(doc => doc.data() as Tekeminen)
          .filter(t => t.Lauluts?.includes(String(laulu.ID)))
          .sort((a, b) => a.tunnusluku - b.tunnusluku);
    
        setTekemiset(laulunTekemiset);
      } catch (error) {
        console.error('Error fetching tekemiset:', error);
      }
    }
  
    fetchTekemiset();
  }, [laulu]);

  const handleAction = (tekeminen: Tekeminen) => {
    if (!laulu?.Name) return;
    
    // Audio sivu: MP3 ja Karaoke
    if (tekeminen.tunnusluku === 1 || tekeminen.tunnusluku === 2) {
      router.push(`/audio/${resolvedParams.lauluId}?type=${tekeminen.tunnusluku === 1 ? 'mp3' : 'karaoke'}`);
      return;
    }
  
    // PDF sivu: Tulosteet ja Nuotit
    if (tekeminen.tunnusluku === 3 || tekeminen.tunnusluku === 4) {
      router.push(`/pdf/${resolvedParams.lauluId}?type=${tekeminen.tunnusluku === 3 ? 'tulosteet' : 'nuotit'}`);
      return;
    }
  
    // Pelit: tunnusluvut 5-8
    if (tekeminen.tunnusluku >= 5 && tekeminen.tunnusluku <= 8) {
      router.push(`/pelit/${resolvedParams.lauluId}?url=${encodeURIComponent(tekeminen['Pelin osoite'])}`);
      return;
    }

    // Tunnusluku 9 ohjataan viewer-sivulle
    if (tekeminen.tunnusluku === 9) {
      router.push(`/viewer?type=video&url=${encodeURIComponent(tekeminen['Pelin osoite'])}`);
      return;
    }
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.back()}
        />
        <div className="flex-1"></div>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[1050px] mx-auto px-4 mt-0">
        <div className="relative bg-[#f6f7e7] rounded-lg overflow-hidden aspect-video">
          {laulu?.['Video url'] && (
            <iframe
              src={laulu['Video url']}
              className="absolute top-0 left-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>

      <div className="w-full max-w-[1050px] mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {tekemiset.map((tekeminen) => (
            <button
              key={tekeminen.ID}
              onClick={() => handleAction(tekeminen)}
              className="bg-white p-7 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform flex items-center justify-center"
            >
              <span className="text-sm text-center">
                {tekeminen.TYYLI}
              </span>
            </button>
          ))}
        </div>
      </div>  
    </div>
  )
}