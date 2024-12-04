'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import { db } from '@/lib/firebase'
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import Image from 'next/image'

interface Muskari {
 ID: number
 Name: string
 osoite: string
 'järj num': number
 'New Property': string
 id: string
}

function parseImageData(jsonString: string) {
 try {
   const fixedString = jsonString.replace(/'/g, '"')
   return JSON.parse(fixedString)
 } catch {
   return null
 }
}

export default function MuskaritPage() {
 const router = useRouter()
 const [muskarit, setMuskarit] = useState<Muskari[]>([])
 const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({})

 useEffect(() => {
   const fetchMuskarit = async () => {
     const muskaritCol = collection(db, 'muskarit')
     const muskaritSnapshot = await getDocs(muskaritCol)
     const muskaritList = muskaritSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
       ...doc.data(),
       id: doc.id
     })) as Muskari[]

     const sortedMuskarit = muskaritList.sort((a, b) => a['järj num'] - b['järj num'])
     setMuskarit(sortedMuskarit)

     for (const muskari of sortedMuskarit) {
       try {
         const imageData = parseImageData(muskari['New Property'])
         if (imageData?.filename) {
           const imageRef = ref(storage, `images/muskarit/${imageData.filename}`)
           const url = await getDownloadURL(imageRef)
           setImageUrls(prev => ({ ...prev, [muskari.ID]: url }))
         }
       } catch (error) {
         console.error('Image fetching error:', error)
       }
     }
   }

   fetchMuskarit()
 }, [])

 const handleMuskariClick = (muskari: Muskari) => {
   const params = new URLSearchParams({
     url: muskari.osoite,
     type: 'video'
   })
   router.push(`/viewer?${params.toString()}`)
 }

 return (
   <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
     <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
       <ArrowLeft 
         className="cursor-pointer" 
         size={45} 
         strokeWidth={3}
         onClick={() => router.push('/home')}
       />
       <h1 className="text-4xl font-semibold flex-1 text-center">
         MUSKARIT
       </h1>
       <div className="w-[45px]"></div>
     </div>

     <div className="w-full max-w-[580px] mt-8">
       {muskarit.map((muskari, index) => (
         <div
           key={muskari.ID}
           onClick={() => handleMuskariClick(muskari)}
           className="mb-3 cursor-pointer"
         >
           <div className="flex items-center bg-white rounded-lg p-2 h-[75px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
             <div className="w-[75px] h-[75px] relative rounded-lg overflow-hidden ml-2">
               {imageUrls[muskari.ID] ? (
                 <Image
                   src={imageUrls[muskari.ID]}
                   alt={muskari.Name}
                   fill
                   priority={index < 4}
                   className="object-cover"
                   sizes="75px"
                 />
               ) : (
                 <div className="w-full h-full bg-gray-200 animate-pulse" />
               )}
             </div>
             <span className="ml-4 text-xl">{muskari.Name}</span>
           </div>
         </div>
       ))}
     </div>
   </div>
 )
}