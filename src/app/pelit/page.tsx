'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { getFullImageUrl } from '@/utils/imageUtils'

export default function PelitPage() {
  const router = useRouter()

  const categories = useMemo(() => [
    { 
      title: 'LAULUPELIT', 
      imageUrl: getFullImageUrl('Kuvake_laulupelit.jpg', 'common'),
      category: 'laulupelit' 
    },
    { 
      title: 'SANAPELIT', 
      imageUrl: getFullImageUrl('Kuvake_sanapelit.jpg', 'common'),
      category: 'sanapelit' 
    },
    { 
      title: 'VALINTAPELIT', 
      imageUrl: getFullImageUrl('Kuvake_valintapelit.jpg', 'common'),
      category: 'valintapelit' 
    },
    { 
      title: 'MUISTIPELIT', 
      imageUrl: getFullImageUrl('Kuvake_muistipelit.jpg', 'common'),
      category: 'muistipelit' 
    },
    { 
      title: 'MUUT', 
      imageUrl: getFullImageUrl('Kuvake_muut.jpg', 'common'),
      category: 'muut' 
    },
    { 
      title: 'LAULUTAULUTESTI', 
      imageUrl: getFullImageUrl('Kuvake_laulutaulut.jpg', 'common'),
      route: '/pelit/laulutaulut',
      category: 'laulutaulut'
    },
  ], [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={42} 
          strokeWidth={2}
          onClick={() => router.push('/home')}
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-semibold flex-1 text-center">
          PELIT
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mt-3">
        {categories.map((category, index) => (
          <Link 
            href={category.route || `/pelit/kategoria/${category.category}`}
            key={category.title}
            className="flex justify-center"
          >
            <div className="w-[170px] h-[170px] sm:w-[180px] sm:h-[180px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] bg-white rounded-lg hover:scale-[1.02] transition-transform">
              <QuickImage
                src={category.imageUrl}
                alt={category.title}
                fill
                priority={index < 4}
                className="object-cover rounded-lg"
                sizes="(max-width: 640px) 170px, 180px"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}