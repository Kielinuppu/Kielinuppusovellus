'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MuutPage() {
  const router = useRouter()
  
  const categories = [
    { name: 'BINGOT', id: 'bingot' },
    { name: 'NOPAT', id: 'nopat' },
    { name: 'LAUTAPELIT', id: 'lautapelit' }
  ]

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex justify-between px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={42} 
          strokeWidth={2}
          onClick={() => router.push('/pelit')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center truncate">
          MUUT
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="w-full max-w-[580px] mt-4 sm:mt-8">
        {categories.map((category) => (
          <Link 
            href={`/pelit/kategoria/muut/muusisalto?laji=${category.id}`} 
            key={category.id}
            className="block mb-2 sm:mb-3"
          >
            <div className="flex items-center bg-white rounded-lg p-2 h-[65px] sm:h-[77px] shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:scale-[1.02] transition-transform">
              <span className="text-[14px] lg:text-[20px] flex-1 text-center truncate px-2">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}