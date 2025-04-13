'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Maximize, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Sisältökomponentti
function LaulutauluContent({ id }: { id: string }) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const decodedId = decodeURIComponent(id);

  useEffect(() => {
    let isMounted = true;

    async function fetchLaulutaulu() {
      try {
        const laulutauluDoc = doc(db, 'laulutaulut', decodedId);
        const docSnap = await getDoc(laulutauluDoc);

        if (!isMounted) return;

        if (docSnap.exists()) {
          const data = docSnap.data();
          const pageUrl = data['pelin osoite'] || data.pelin_osoite || data['peliin osoite'] || '';
          setUrl(pageUrl);
        } else {
          setError('Laulutaulua ei löytynyt');
        }
      } catch {
        // Poistettu _-parametri, koska sitä ei käytetä
        if (isMounted) {
          setError('Virhe laulutaulun haussa');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLaulutaulu();

    return () => {
      isMounted = false;
    };
  }, [decodedId]);

  // Automaattinen koko näytön tila, kun sivu on valmis
  useEffect(() => {
    if (!loading && url && iframeContainerRef.current) {
      // Pieni viive, jotta komponentti ehtii renderöityä
      const timer = setTimeout(() => {
        if (iframeContainerRef.current && !document.fullscreenElement) {
          iframeContainerRef.current.requestFullscreen().catch(err => {
            console.error(`Virhe automaattisessa koko näytön tilassa: ${err}`);
          });
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, url]);

  // Koko näytön tilan hallinta
  const enterFullScreen = () => {
    if (iframeContainerRef.current) {
      iframeContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Virhe koko näytön tilaan siirryttäessä: ${err.message}`);
      });
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center justify-center">
        <p className="text-xl">Ladataan...</p>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex flex-col">
        <div className="sticky top-0 w-full flex px-2 bg-[#e9f1f3] py-2 z-10">
          <ArrowLeft 
            className="cursor-pointer" 
            size={42} 
            strokeWidth={2}
            onClick={() => router.push('/pelit/laulutaulut')}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] m-4">
            <p className="text-red-500 text-lg">{error || 'Laulutaulua ei löytynyt'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#e9f1f3] relative">
      {!isFullScreen && (
        <>
          <div className="absolute top-2 left-2 z-30">
            <button 
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-all"
              onClick={() => router.push('/pelit/laulutaulut')}
            >
              <ArrowLeft size={28} />
            </button>
          </div>
          
          <div className="absolute top-2 right-2 z-30">
            <button 
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-all"
              onClick={enterFullScreen}
            >
              <Maximize size={28} />
            </button>
          </div>
        </>
      )}

      <div 
        ref={iframeContainerRef} 
        className="w-[95%] h-[90%] mx-auto my-4 rounded-lg shadow-lg overflow-hidden"
      >
        {isFullScreen && (
          <div 
            className="fixed top-2 right-2 z-50"
            style={{ pointerEvents: 'auto' }}
          >
            <button 
              className="p-2 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-90 transition-all"
              onClick={() => document.exitFullscreen()}
            >
              <X size={28} />
            </button>
          </div>
        )}
        
        <iframe
          src={url}
          className="w-full h-full border-0"
          title="Laulutaulu"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// Pääkomponentti
export default function LaulutauluPage(props: { params: Promise<{ id: string }> }) {
  const params = React.use(props.params); // Purkaa params-Promise

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
          <p className="text-xl">Ladataan...</p>
        </div>
      }
    >
      <LaulutauluContent id={params.id} />
    </Suspense>
  );
}