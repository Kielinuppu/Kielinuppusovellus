'use client'

import { useEffect, useState } from 'react'
import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getFullImageUrl } from '@/utils/imageUtils'
import { BingoData, parseBingoImage } from '@/types/bingo'

interface Bingo {
 id: string;
 ID: number;
 Name: string;
 kuva: BingoData;
 peliosoite: string;
}

export default function MuutPage() {
 const router = useRouter()
 const [bingos, setBingos] = useState<Bingo[]>([])

 useEffect(() => {
   async function fetchBingos() {
     try {
       const bingotRef = collection(db, 'bingot')
       const querySnapshot = await getDocs(bingotRef)

       const bingoData = querySnapshot.docs.map(doc => {
         const data = doc.data()
         return {
           id: doc.id,
           ...data,
           kuva: parseBingoImage(data.kuva)
         }
       }) as Bingo[]

       const sortedBingos = bingoData.sort((a, b) => a.Name.localeCompare(b.Name))
       setBingos(sortedBingos)
     } catch (error) {
       console.error('Virhe bingojen haussa:', error)
     }
   }

   fetchBingos()
 }, [])

 return (
   <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
     <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
       <ArrowLeft 
         className="cursor-pointer" 
         size={45} 
         strokeWidth={3}
         onClick={() => router.push('/pelit')}
       />
       <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center">
         MUUT
       </h1>
       <div className="w-[45px]"></div>
     </div>

     <div className="w-full max-w-[580px] mt-4 sm:mt-8">
       {bingos.map((bingo, index) => (
         <Link 
           key={bingo.id}
           href={`/pelit/kategoria/muut/bingosivu?id=${bingo.id}`} 
           className="block mb-2 sm:mb-3"
         >
           <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
             <div className="w-[65px] h-[65px] sm:w-[77px] sm:h-[77px] relative rounded-lg overflow-hidden ml-2">
               {bingo.kuva ? (
                 <QuickImage
                   src={bingo.kuva.url 
                     ? `https://firebasestorage.googleapis.com/v0/b/kielinuppu-sovellus.firebasestorage.app/o/images%2Fbingot%2F${bingo.kuva.url}?alt=media`
                     : getFullImageUrl(bingo.kuva.filename, 'bingot')}
                   alt={bingo.Name}
                   fill
                   priority={index < 4}
                   className="object-cover"
                   sizes="(max-width: 640px) 65px, 77px"
                 />
               ) : (
                 <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg" />
               )}
             </div>
             <span className="ml-3 sm:ml-4 text-[14px] lg:text-[20px] truncate max-w-[calc(100%-90px)]">
               {bingo.Name}
             </span>
           </div>
         </Link>
       ))}
     </div>
   </div>
 )
}