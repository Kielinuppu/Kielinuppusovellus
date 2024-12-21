'use client'

import React, { use } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, FileText, MousePointer2 } from 'lucide-react'

interface PdfFileInfo {
  url: string;
  size: number;
  filename: string;
}

interface Laulu {
  ID: number;
  Name: string;
  Nuotit: string;
  Tulosteet: string;
}

export default function PdfLayout({
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;
  
    const fetchLaulu = async () => {
      if (!resolvedParams.lauluId) return;
  
      try {
        const lauluDoc = await getDoc(doc(db, 'laulut', resolvedParams.lauluId));
  
        if (!mounted) return;
  
        if (!lauluDoc.exists()) {
          setError('Laulua ei löytynyt');
          return;
        }
  
        const lauluData = lauluDoc.data() as Laulu;
        setLaulu(lauluData);
  
        const pdfData = type === 'nuotit' ? lauluData.Nuotit : lauluData.Tulosteet;
  
        if (!pdfData) {
          setError('PDF-tiedostoa ei löytynyt');
          return;
        }
  
        let fileName = '';
        try {
          // Tarkistetaan, onko data JSON-muodossa vai pelkkä tiedostonimi
          if (pdfData.startsWith('{')) {
            const pdfInfo = JSON.parse(pdfData.replace(/'/g, '"')) as PdfFileInfo;
            fileName = pdfInfo.filename;
          } else {
            fileName = pdfData; // Jos ei JSON, oletetaan että se on tiedostonimi
          }
  
          const folderPath = type === 'nuotit' ? 'nuotit' : 'tulosteet';
          const pdfPath = `Laulut/${folderPath}/${fileName}`;
  
          const storage = getStorage();
          const pdfRef = ref(storage, pdfPath);
          const url = await getDownloadURL(pdfRef);
  
          if (!mounted) return;
          setPdfUrl(url);
        } catch (error) {
          console.error('Virhe PDF URL:n haussa:', error);
          if (mounted) setError('PDF-tiedoston lataus epäonnistui');
        }
      } catch (error) {
        console.error('Virhe:', error);
        if (mounted) setError('Virhe tietojen latauksessa');
      }
    };
  
    fetchLaulu();
  
    return () => {
      mounted = false;
    };
  }, [resolvedParams.lauluId, type]);

  return (
    <div className="bg-[#e9f1f3] min-h-screen p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.back()}
        />
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-semibold">
            {laulu?.Name || ''} {type === 'nuotit' ? '(Nuotit)' : '(Tulosteet)'}
          </h1>
          {pdfUrl && (
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
              <MousePointer2 size={16} />
              <span className="text-sm">Paina hiiren oikeaa näppäintä tallentaaksesi tai tulostaaksesi</span>
            </div>
          )}
        </div>
        <div className="w-[45px]"></div>
      </div>

      <div className="max-w-[90%] mx-auto mt-4">
        {error ? (
          <div className="bg-white rounded-[10px] p-6 shadow-[rgba(0,0,0,0.4)_-4px_4px_4px] text-center">
            <div className="text-red-500 mb-4">
              <FileText size={48} />
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] p-4 shadow-[rgba(0,0,0,0.4)_-4px_4px_4px]">
            {pdfUrl && (
              <div className="w-full aspect-[1.4/1] relative">
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  className="w-full h-full rounded-lg"
                  title={`${laulu?.Name || 'PDF'} ${type}`}
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}