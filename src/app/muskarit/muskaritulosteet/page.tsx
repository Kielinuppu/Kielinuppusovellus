'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import Link from 'next/link'

interface Tuloste {
 id: string;
 Id: number;
 nimi: string;
 järjestys: number;
 pdf: string;
}

export default function MuskaritulosteetPage() {
 const router = useRouter()
 const [tulosteet, setTulosteet] = useState<Tuloste[]>([])

 useEffect(() => {
   const fetchTulosteet = async () => {
     try {
       const tulosteRef = collection(db, 'muskaritulosteet')
       const snapshot = await getDocs(tulosteRef)
       
       const data = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
       })) as Tuloste[]
       
       const sortedTulosteet = data.sort((a, b) => a.järjestys - b.järjestys)
       setTulosteet(sortedTulosteet)
     } catch (error) {
       console.error('Error fetching tulosteet:', error)
     }
   }

   fetchTulosteet()
 }, [])

 return (
   <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
     <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
       <ArrowLeft 
         className="cursor-pointer ml-3 sm:ml-4" 
         size={45} 
         strokeWidth={3}
         onClick={() => router.push('/muskarit')}
       />
       <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center truncate">
         MATERIAALIT
       </h1>
       <div className="w-[45px]"></div>
     </div>

     <div className="w-full max-w-[580px] mt-4 sm:mt-8">
       {tulosteet.map((tuloste) => (
         <Link 
           key={tuloste.id}
           href={`/viewer?type=pdf&url=${encodeURIComponent(`pdf/${tuloste.pdf}`)}&title=${encodeURIComponent(tuloste.nimi)}`}
           className="block mb-2 sm:mb-3"
         >
           <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
             <span className="text-[14px] lg:text-[20px] flex-1 text-center truncate px-2">
               {tuloste.nimi}
             </span>
           </div>
         </Link>
       ))}
     </div>
   </div>
 )
}