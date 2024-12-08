'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Minus, LucideIcon } from 'lucide-react'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import QuickImage from '@/components/QuickImage'
import { getFullImageUrl } from '@/utils/imageUtils'
import { ImageData, parseImageData } from '@/types/image'

interface Laulu {
  id: string;
  Name: string;
  'Laulun kuvake': string;
  parsedImage?: ImageData | null;
}

interface Playlist {
  ID: number;
  Name: string;
  Lauluts: string | string[];
  User: string;
  Created: string;
  Updated: string;
}

interface SongItemProps {
  song: Laulu;
  actionIcon: LucideIcon;
  onAction: () => void;
}

function SoittolistaContent() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const playlistId = searchParams.get('id')
 const [searchTerm, setSearchTerm] = useState('')
 const [availableSongs, setAvailableSongs] = useState<Laulu[]>([])
 const [selectedSongs, setSelectedSongs] = useState<Laulu[]>([])

 useEffect(() => {
   const fetchLaulut = async () => {
     try {
       const laulutSnapshot = await getDocs(collection(db, 'laulut'))
       const fetchedLaulut = laulutSnapshot.docs.map(doc => ({
         id: doc.id,
         Name: doc.data().Name,
         'Laulun kuvake': doc.data()['Laulun kuvake'],
         parsedImage: parseImageData(doc.data()['Laulun kuvake'])
       }))
       setAvailableSongs(fetchedLaulut.sort((a, b) => 
         a.Name.localeCompare(b.Name, 'fi')
       ))
     } catch (error) {
       console.error('Virhe laulujen haussa:', error)
     }
   }
   fetchLaulut()
 }, [])

 useEffect(() => {
   const fetchPlaylist = async () => {
     if (!playlistId) return
     try {
       const docRef = doc(db, 'soittolistat', playlistId)
       const docSnap = await getDoc(docRef)
       if (docSnap.exists()) {
         const playlistData = docSnap.data() as Playlist
         
         if (playlistData.Lauluts && typeof playlistData.Lauluts === 'string' && playlistData.Lauluts.length > 0) {
           const songIds = playlistData.Lauluts.split(',')
           const selectedLaulut = availableSongs.filter(song => songIds.includes(song.id))
           setSelectedSongs(selectedLaulut)
         }
       }
     } catch (error) {
       console.error('Virhe soittolistan haussa:', error)
     }
   }

   if (availableSongs.length > 0) {
     fetchPlaylist()
   }
 }, [playlistId, availableSongs])

 const filteredSongs = availableSongs.filter(laulu =>
   laulu.Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
   !selectedSongs.some(selected => selected.id === laulu.id)
 )

 const handleDone = async () => {
   if (!playlistId) return
   try {
     const docRef = doc(db, 'soittolistat', playlistId)
     await updateDoc(docRef, {
       Lauluts: selectedSongs.map(song => song.id).join(','),
       Updated: new Date().toISOString()
     })
     router.push('/soittolistat')
   } catch (error) {
     console.error('Virhe tallennuksessa:', error)
   }
 }

 const SongItem = ({ song, actionIcon: ActionIcon, onAction }: SongItemProps) => (
   <div className="bg-white rounded-lg h-[65px] sm:h-[75px] flex justify-between items-center p-2 shadow-[rgba(0,0,0,0.2)_-4px_4px_4px]">
     <div className="flex items-center flex-1">
       <div className="w-[65px] h-[65px] sm:w-[75px] sm:h-[75px] relative rounded-lg overflow-hidden">
         {song.parsedImage ? (
           <QuickImage
             src={getFullImageUrl(song.parsedImage.filename, 'laulut')}
             alt={song.Name}
             fill
             className="object-cover"
             sizes="(max-width: 640px) 65px, 75px"
           />
         ) : (
           <div className="w-full h-full bg-gray-200 animate-pulse" />
         )}
       </div>
       <span className="ml-3 sm:ml-4 text-[14px] lg:text-[20px] truncate max-w-[calc(100%-90px)]">{song.Name}</span>
     </div>
     <ActionIcon
       className="cursor-pointer"
       size={32}
       onClick={onAction}
     />
   </div>
 )

 return (
   <div className="min-h-screen bg-[#e9f1f3] p-4">
     <div className="sticky top-0 flex justify-between items-center mb-6">
       <ArrowLeft 
         className="cursor-pointer text-black" 
         size={45} 
         strokeWidth={3}
         onClick={() => router.push('/soittolistat')}
       />
       <button
         onClick={handleDone}
         className="bg-[#F6F7E7] px-6 py-2 rounded-lg font-bold sm:block hidden"
       >
         VALMIS
       </button>
     </div>

     {/* Desktop view */}
     <div className="hidden sm:flex space-x-4">
       <div className="w-1/2">
         <h2 className="text-xl font-bold mb-4">LISÄÄ LAULUJA SOITTOLISTALLE</h2>
         <input
           type="text"
           placeholder="ETSI LAULUA"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full p-4 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] mb-4"
         />
         <div className="space-y-2">
           {filteredSongs.map((song) => (
             <SongItem
               key={song.id}
               song={song}
               actionIcon={Plus}
               onAction={() => setSelectedSongs([...selectedSongs, song])}
             />
           ))}
         </div>
       </div>

       <div className="w-1/2">
         <h2 className="text-xl font-bold mb-4">LAULUT SOITTOLISTALLA</h2>
         <div className="space-y-2">
           {selectedSongs.map((song) => (
             <SongItem
               key={song.id}
               song={song}
               actionIcon={Minus}
               onAction={() => setSelectedSongs(selectedSongs.filter(s => s.id !== song.id))}
             />
           ))}
         </div>
       </div>
     </div>

     {/* Mobile view */}
     <div className="sm:hidden">
       <div className="mb-4">
         <h2 className="text-[26px] font-bold">LISÄÄ LAULUJA</h2>
       </div>
       
       <input
         type="text"
         placeholder="ETSI LAULUA"
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         className="w-full p-4 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] mb-4 text-[14px]"
       />
       
       <div className="h-[350px] overflow-y-auto mb-6 space-y-2">
         {filteredSongs.map((song) => (
           <SongItem
             key={song.id}
             song={song}
             actionIcon={Plus}
             onAction={() => setSelectedSongs([...selectedSongs, song])}
           />
         ))}
       </div>

       <div className="flex justify-between items-center mb-4">
         <h2 className="text-[26px] font-bold">LAULUT SOITTOLISTALLA</h2>
         <button
           onClick={handleDone}
           className="bg-[#F6F7E7] px-6 py-2 rounded-lg font-bold"
         >
           VALMIS
         </button>
       </div>

       <div className="space-y-2">
         {selectedSongs.map((song) => (
           <SongItem
             key={song.id}
             song={song}
             actionIcon={Minus}
             onAction={() => setSelectedSongs(selectedSongs.filter(s => s.id !== song.id))}
           />
         ))}
       </div>
     </div>
   </div>
 )
}

export default function SoittolistaPage() {
 return (
   <Suspense fallback={
     <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
       <div>Ladataan...</div>
     </div>
   }>
     <SoittolistaContent />
   </Suspense>
 )
}