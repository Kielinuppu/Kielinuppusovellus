'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Minus } from 'lucide-react'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import Image from 'next/image'

interface Laulu {
id: string;
Name: string;
'Laulun kuvake': string;
}

interface Playlist {
ID: number;
Name: string;
Lauluts: string | string[];
User: string;
Created: string;
Updated: string;
}

function parseImageData(jsonString: string) {
try {
  const fixedString = jsonString.replace(/'/g, '"')
  return JSON.parse(fixedString)
} catch {
  return null
}
}

function SoittolistaContent() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const playlistId = searchParams.get('id')
 const [searchTerm, setSearchTerm] = useState('')
 const [availableSongs, setAvailableSongs] = useState<Laulu[]>([])
 const [selectedSongs, setSelectedSongs] = useState<Laulu[]>([])
 const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({})

 useEffect(() => {
   const fetchLaulut = async () => {
     try {
       const laulutSnapshot = await getDocs(collection(db, 'laulut'))
       const fetchedLaulut = laulutSnapshot.docs.map(doc => ({
         id: doc.id,
         Name: doc.data().Name,
         'Laulun kuvake': doc.data()['Laulun kuvake']
       }))
       setAvailableSongs(fetchedLaulut.sort((a, b) => 
         a.Name.localeCompare(b.Name, 'fi')
       ))

       // Hae kuvat
       for (const laulu of fetchedLaulut) {
         try {
           const imageData = parseImageData(laulu['Laulun kuvake'])
           if (imageData?.filename) {
             const imageRef = ref(storage, `images/laulut/${imageData.filename}`)
             const url = await getDownloadURL(imageRef)
             setImageUrls(prev => ({ ...prev, [laulu.id]: url }))
           }
         } catch (error) {
           console.error('Image fetching error:', error)
         }
       }
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
         className="bg-[#F6F7E7] px-6 py-2 rounded-lg font-bold"
       >
         VALMIS
       </button>
     </div>

     <div className="flex space-x-4">
       <div className="w-1/2">
         <h2 className="text-xl font-bold mb-4">LISÄÄ LAULUJA SOITTOLISTALLE</h2>
         <input
           type="text"
           placeholder="ETSI LAULUA"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full p-4 rounded-lg shadow-md mb-4"
         />
         <div className="space-y-2">
           {filteredSongs.map((song) => (
             <div 
               key={song.id}
               className="bg-white rounded-lg h-[75px] flex justify-between items-center p-2"
             >
               <div className="flex items-center flex-1">
                 <div className="w-[75px] h-[75px] relative rounded-lg overflow-hidden">
                   {imageUrls[song.id] ? (
                     <Image
                       src={imageUrls[song.id]}
                       alt={song.Name}
                       fill
                       className="object-cover"
                       sizes="75px"
                     />
                   ) : (
                     <div className="w-full h-full bg-gray-200 animate-pulse" />
                   )}
                 </div>
                 <span className="ml-4">{song.Name}</span>
               </div>
               <Plus
                 className="cursor-pointer"
                 size={32}
                 onClick={() => setSelectedSongs([...selectedSongs, song])}
               />
             </div>
           ))}
         </div>
       </div>

       <div className="w-1/2">
         <h2 className="text-xl font-bold mb-4">LAULUT SOITTOLISTALLA</h2>
         <div className="space-y-2">
           {selectedSongs.map((song) => (
             <div 
               key={song.id}
               className="bg-white rounded-lg h-[75px] flex justify-between items-center p-2"
             >
               <div className="flex items-center flex-1">
                 <div className="w-[75px] h-[75px] relative rounded-lg overflow-hidden">
                   {imageUrls[song.id] ? (
                     <Image
                       src={imageUrls[song.id]}
                       alt={song.Name}
                       fill
                       className="object-cover"
                       sizes="75px"
                     />
                   ) : (
                     <div className="w-full h-full bg-gray-200 animate-pulse" />
                   )}
                 </div>
                 <span className="ml-4">{song.Name}</span>
               </div>
               <Minus
                 className="cursor-pointer"
                 size={32}
                 onClick={() => setSelectedSongs(selectedSongs.filter(s => s.id !== song.id))}
               />
             </div>
           ))}
         </div>
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