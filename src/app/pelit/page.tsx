'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import Image from 'next/image'
import Link from 'next/link'

export default function PelitPage() {
  const router = useRouter()
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({})

  const categories = useMemo(() => [
    { title: 'LAULUPELIT', image: 'Kuvake_laulupelit.jpg', category: 'laulupelit' },
    { title: 'SANAPELIT', image: 'Kuvake_sanapelit.jpg', category: 'sanapelit' },
    { title: 'VALINTAPELIT', image: 'Kuvake_valintapelit.jpg', category: 'valintapelit' },
    { title: 'MUISTIPELIT', image: 'Kuvake_muistipelit.jpg', category: 'muistipelit' },
    { title: 'MUUT', image: 'Kuvake_muut.jpg', category: 'muut' }
  ], [])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const urls: {[key: string]: string} = {}
        for (const category of categories) {
          const imageRef = ref(storage, `images/common/${category.image}`)
          const url = await getDownloadURL(imageRef)
          urls[category.title] = url
        }
        setImageUrls(urls)
      } catch (error) {
        console.error('Error fetching images:', error)
      }
    }

    fetchImages()
  }, [categories])

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
          PELIT
        </h1>
        <div className="w-[45px]"></div>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 max-w-6xl mt-8">
        {categories.map((category) => (
          <Link href={`/pelit/kategoria/${category.category}`} key={category.title}>
            <div className="w-[190px] sm:w-[170px] md:w-[190px] h-[190px] sm:h-[170px] md:h-[190px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] bg-white rounded-lg hover:scale-[1.02] transition-transform">
              {imageUrls[category.title] && (
                <Image
                  src={imageUrls[category.title]}
                  alt={category.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 170px, 190px"
                  priority={true}
                />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}