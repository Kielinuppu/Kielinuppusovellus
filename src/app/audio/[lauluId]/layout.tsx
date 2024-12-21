'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { ArrowLeft, Music, Play, Pause, RotateCw, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { use } from 'react'

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

const CustomAudioPlayer = ({ audioUrl }: { audioUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(true) // Changed to true for autoplay
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Add autoplay effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Autoplay prevented:', error)
        setIsPlaying(false)
      })
    }
  }, [audioUrl])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSkip = (direction: 'forward' | 'back') => {
    if (audioRef.current) {
      audioRef.current.currentTime += direction === 'forward' ? 20 : -20
    }
  }

  return (
    <div className="w-full p-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration)
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="mb-6">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => {
            const time = parseFloat(e.target.value)
            if (audioRef.current) {
              audioRef.current.currentTime = time
            }
            setCurrentTime(time)
          }}
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-2 text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-20">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => handleSkip('back')}>
            <div className="h-12 flex items-center">
              <RotateCcw className="w-6 h-6 stroke-black" />
            </div>
            <span className="text-xs text-gray-600">20s</span>
          </div>
          
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 stroke-black" />
            ) : (
              <Play className="w-8 h-8 stroke-black ml-1" />
            )}
          </div>
          
          <div className="flex flex-col items-center cursor-pointer" onClick={() => handleSkip('forward')}>
            <div className="h-12 flex items-center">
              <RotateCw className="w-6 h-6 stroke-black" />
            </div>
            <span className="text-xs text-gray-600">20s</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AudioLayout({
  children,
  params: paramsPromise
}: {
  children: React.ReactNode;
  params: Promise<{ lauluId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const [laulu, setLaulu] = useState<Laulu | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLaulu = async () => {
      const lauluId = params.lauluId;
      if (!lauluId) return;

      try {
        const lauluDoc = await getDoc(doc(db, 'laulut', lauluId));
        
        if (!mounted) return;
        
        if (!lauluDoc.exists()) {
          setError('Laulua ei löytynyt');
          return;
        }

        const lauluData = lauluDoc.data() as Laulu;
        setLaulu(lauluData);

        if (lauluData['Laulun kuvake']) {
          try {
            const imageInfo = JSON.parse(lauluData['Laulun kuvake'].replace(/'/g, '"')) as ImageFileInfo;
            const storage = getStorage();
            const imagePath = `images/laulut/${imageInfo.filename}`;
            const imageRef = ref(storage, imagePath);
            const imageUrl = await getDownloadURL(imageRef);
            if (mounted) setImageUrl(imageUrl);
          } catch (error) {
            console.error('Virhe kuvan latauksessa:', error);
          }
        }

        const audioData = type === 'karaoke' ? lauluData['audio instrumental'] : lauluData.audio;

        if (!audioData) {
          setError('Äänitiedostoa ei löytynyt');
          return;
        }

        try {
          const audioInfo = JSON.parse(audioData.replace(/'/g, '"')) as AudioFileInfo;
          const storage = getStorage();
          const fileName = audioInfo.filename;
          const folderPath = type === 'karaoke' ? 'instrumental' : 'audio';
          const audioPath = `Laulut/${folderPath}/${fileName}`;
          
          const audioRef = ref(storage, audioPath);
          const url = await getDownloadURL(audioRef);
          
          if (!mounted) return;
          setAudioUrl(url);
        } catch (error) {
          console.error('Virhe audio URL:n haussa:', error);
          if (mounted) setError('Äänitiedoston lataus epäonnistui');
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
  }, [params.lauluId, type]);

  return (
    <div className="bg-[#e9f1f3] min-h-screen p-4 pt-2">
      {/* Desktop: nuoli vasemmalla ylhäällä */}
      <div className="hidden md:block absolute left-6 top-2 z-20">
        <ArrowLeft 
          className="cursor-pointer"
          size={45}
          strokeWidth={3}
          onClick={() => router.back()}
        />
      </div>

      {/* Mobiili: nuoli stickynä */}
      <div className="sticky md:hidden top-0 w-full flex px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer"
          size={45}
          strokeWidth={3}
          onClick={() => router.back()}
        />
      </div>

      <div className="max-w-md mx-auto md:mt-6">
        {error ? (
          <div className="rounded-lg p-6 text-center">
            <div className="text-red-500 mb-4">
              <Music size={48} />
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="rounded-lg p-4">
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
            
            {audioUrl && <CustomAudioPlayer audioUrl={audioUrl} />}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}