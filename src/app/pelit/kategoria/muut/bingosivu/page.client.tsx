'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'

interface Bingo {
 ID: number;
 Name: string;
 peliosoite: string;
 pelialustat: {
   url?: string;
   filename: string;
 };
 'osoite vai ei': number;
}

function BingoContent() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const [bingo, setBingo] = useState<Bingo | null>(null)

 useEffect(() => {
   async function fetchBingo() {
     const bingoId = searchParams.get('id')

     if (!bingoId) return

     try {
       const bingoRef = doc(db, 'bingot', bingoId)
       const bingoSnap = await getDoc(bingoRef)
       
       if (bingoSnap.exists()) {
         setBingo(bingoSnap.data() as Bingo)
       }
     } catch (error) {
       console.error('Virhe bingon haussa:', error)
     }
   }

   fetchBingo()
 }, [searchParams])

 return (
   <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
     <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
       <ArrowLeft 
         className="cursor-pointer" 
         size={45} 
         strokeWidth={3}
         onClick={() => router.back()}
       />
       <h1 className="text-4xl font-semibold flex-1 text-center">
         {bingo?.Name || 'Ladataan...'}
       </h1>
       <div className="w-[45px]"></div>
     </div>

     <div className="w-full max-w-[500px] mt-8 flex flex-col items-center gap-4">
       {bingo?.['osoite vai ei'] === 1 && (
         <Link
           href={`/pelit/peli/${encodeURIComponent(bingo.peliosoite)}`}
           className="bg-white rounded-lg w-[400px] h-[75px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center"
         >
           <span className="text-xl text-gray-600">ARVONTAKONE</span>
         </Link>
       )}
       
       {bingo?.pelialustat?.filename && (
         <Link
           href={`/viewer?type=pdf&url=${encodeURIComponent(`pdf/${bingo.pelialustat.filename}`)}&title=TULOSTETTAVAT PELIALUSTAT`}
           className="bg-white rounded-lg w-[500px] h-[75px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center"
         >
           <span className="text-xl text-gray-600">TULOSTETTAVAT PELIALUSTAT</span>
         </Link>
       )}
     </div>
   </div>
 )
}

export default function BingoPage() {
 return (
   <Suspense fallback={
     <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
       <div>Ladataan...</div>
     </div>
   }>
     <BingoContent />
   </Suspense>
 )
}