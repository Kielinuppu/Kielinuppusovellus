'use client'

import QuickImage from '@/components/QuickImage'
import { useRouter } from 'next/navigation'
import { getFullImageUrl } from '@/utils/imageUtils'

export default function Home() {
 const router = useRouter()
 const logoUrl = getFullImageUrl('logo.png', 'common')

 return (
   <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
     <div className="max-w-[900px] w-full m-0 mb-20 mt-20">
       <QuickImage
         src={logoUrl}
         alt="Kielinuppu logo"
         width={900}
         height={225}
         priority={true}
         className="w-full h-auto object-contain m-0 p-0"
       />
     </div>

     <div className="flex flex-col items-center space-y-5">
       <button 
         onClick={() => router.push('/login')} 
         className="bg-[#f6f7e7] px-6 py-3 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:shadow-md w-64"
       >
         KIRJAUDU
       </button>
       <button 
         onClick={() => router.push('/tutustu')} 
         className="bg-[#f6f7e7] px-6 py-3 rounded-lg shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:shadow-md w-80"
       >
         TUTUSTU SOVELLUKSEEN
       </button>
     </div>
   </div>
 )
}