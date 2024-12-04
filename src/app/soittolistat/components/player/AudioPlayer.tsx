'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCw, RotateCcw, SkipForward, Repeat, X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Image from 'next/image';

interface Song {
  id: string;
  Name: string;
  'Laulun kuvake': string;
  audio: string;
}

const AudioPlayer = ({ playlistId, onClose }: { playlistId: string | null, onClose: () => void }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Muutettu true:ksi
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>('');
  const [isLooping, setIsLooping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragThreshold = 50;

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      if (audio) {
        setDuration(audio.duration);
        if (isPlaying) audio.play(); // Soita automaattisesti kun metadata on ladattu
      }
    };

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      if (audio) {
        if (isLooping) {
          audio.currentTime = 0;
          audio.play();
        } else if (currentSongIndex < songs.length - 1) {
          // Seuraavan kappaleen soitto
          setCurrentSongIndex(prev => prev + 1);
          audio.currentTime = 0;
          setIsPlaying(true); // Pidetään soitto päällä
        } else {
          // Viimeisen kappaleen jälkeen aloitetaan alusta
          setCurrentSongIndex(0);
          setIsPlaying(true);
        }
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [isLooping, currentSongIndex, songs.length, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSongIndex > 0) {
        setCurrentSongIndex(prev => prev - 1);
      }
      if (e.key === 'ArrowRight' && currentSongIndex < songs.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSongIndex, songs.length]);

  const parseImageData = (jsonString: string) => {
    try {
      return JSON.parse(jsonString.replace(/'/g, '"'));
    } catch (error) {
      console.error('Parse error:', jsonString, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchSongs = async () => {
      if (!playlistId) return;
      
      try {
        const docRef = doc(db, 'soittolistat', playlistId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const playlistData = docSnap.data();
          
          if (playlistData.Lauluts) {
            const songIds = playlistData.Lauluts.split(',');
            const songsPromises = songIds.map(async (id: string) => {
              const songDoc = await getDoc(doc(db, 'laulut', id));
              if (songDoc.exists()) {
                return {
                  id,
                  ...songDoc.data()
                } as Song;
              }
              return null;
            });

            const fetchedSongs = (await Promise.all(songsPromises)).filter((song): song is Song => song !== null);
            setSongs(fetchedSongs);

            if (fetchedSongs.length > 0) {
              await loadSongMedia(fetchedSongs[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, [playlistId]);

  const loadSongMedia = async (song: Song) => {
    if (!song) return;
    
    try {
      const imageData = parseImageData(song['Laulun kuvake']);
      if (imageData?.filename) {
        const imageRef = ref(storage, `images/laulut/${imageData.filename}`);
        const imageUrl = await getDownloadURL(imageRef);
        setCurrentImageUrl(imageUrl);
      }

      const audioData = parseImageData(song.audio);
      if (audioData?.filename && audioRef.current) {
        const audioRef = ref(storage, `Laulut/audio/${audioData.filename}`);
        const audioUrl = await getDownloadURL(audioRef);
        setCurrentAudioUrl(audioUrl);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  useEffect(() => {
    if (!songs[currentSongIndex]) return;
    loadSongMedia(songs[currentSongIndex]);
  }, [currentSongIndex, songs]);

  useEffect(() => {
    if (!audioRef.current || !currentAudioUrl) return;
    
    const audio = audioRef.current;
    
    // Tallenna toistokohta vain jos URL ei muuttunut
    const currentPosition = audio.src === currentAudioUrl ? audio.currentTime : 0;
    
    audio.src = currentAudioUrl;
    audio.loop = isLooping;
    
    audio.currentTime = currentPosition;
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  }, [currentAudioUrl, isPlaying, isLooping]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dragDistance = e.clientX - dragStartX;
    
    if (Math.abs(dragDistance) >= dragThreshold) {
      if (dragDistance > 0 && currentSongIndex > 0) {
        setCurrentSongIndex(prev => prev - 1);
        setIsDragging(false);
      } else if (dragDistance < 0 && currentSongIndex < songs.length - 1) {
        setCurrentSongIndex(prev => prev + 1);
        setIsDragging(false);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > dragThreshold;
    const isRightSwipe = distance < -dragThreshold;

    if (isLeftSwipe && currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    }
    
    if (isRightSwipe && currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += 30;
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime -= 10;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#e9f1f3] overflow-auto">
      {/* Sulkunappi */}
      <button
        onClick={onClose}
        className="fixed top-4 right-6 p-1 z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-xl mx-auto pt-16 pb-4 px-4">
        {/* Soittimen pääalue */}
        <div className="mb-6">
          {currentImageUrl && songs[currentSongIndex] && (
            <>
              <div 
                className="relative aspect-square w-full max-w-md mx-auto mb-4 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <Image
                  src={currentImageUrl}
                  alt={songs[currentSongIndex].Name}
                  fill
                  className="object-contain select-none"
                  sizes="(max-width: 768px) 100vw, 400px"
                  draggable={false}
                />
              </div>
              <h2 className="text-xl font-bold text-center mb-6">
                {songs[currentSongIndex].Name}
              </h2>
            </>
          )}

          {/* Audio kontrollit */}
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => {
                  if (!audioRef.current) return;
                  const time = Number(e.target.value);
                  audioRef.current.currentTime = time;
                  setCurrentTime(time);
                }}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">{formatTime(duration)}</span>
            </div>

            <div className="w-full flex justify-between items-center px-4">
              <Repeat 
                className={`w-5 h-5 cursor-pointer ${isLooping ? 'stroke-blue-500' : 'stroke-black'}`}
                onClick={() => setIsLooping(!isLooping)}
              />
              <div className="flex flex-col items-center cursor-pointer" onClick={skipBackward}>
                <RotateCcw className="w-5 h-5 stroke-black" />
                <span className="text-xs text-gray-600">10s</span>
              </div>
              {isPlaying ? 
                <Pause 
                  className="w-6 h-6 stroke-black cursor-pointer"
                  onClick={togglePlay}
                /> : 
                <Play 
                  className="w-6 h-6 stroke-black cursor-pointer"
                  onClick={togglePlay}
                />
              }
              <div className="flex flex-col items-center cursor-pointer" onClick={skipForward}>
                <RotateCw className="w-5 h-5 stroke-black" />
                <span className="text-xs text-gray-600">30s</span>
              </div>
              <SkipForward 
                className="w-5 h-5 stroke-black cursor-pointer"
                onClick={() => setCurrentSongIndex(prev => (prev + 1) % songs.length)}
              />
            </div>
          </div>
        </div>

        {/* Soittolista */}
        <div className="bg-white/10 rounded-lg">
          <div className="space-y-1 p-2">
            {songs.map((song, index) => (
              <button
                key={song.id}
                className={`w-full p-2.5 text-left rounded transition-colors ${
                  index === currentSongIndex ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                onClick={() => setCurrentSongIndex(index)}
              >
                {song.Name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;