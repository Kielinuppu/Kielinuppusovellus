'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import { useEffect, useState, useMemo } from 'react'

export default function TutustuPage() {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState('')
  const [categoryUrls, setCategoryUrls] = useState<{ [key: string]: string }>({})

  const categories = useMemo(() => [
    { title: 'LAULUT', image: 'images/home/laulut.png', path: '/tutustu/tutustu-aihe' },
    { title: 'HAKEMISTO', image: 'images/home/hakemisto.png', path: '' },
    { title: 'SOITTOLISTAT', image: 'images/home/soitin.png', path: '' },
    { title: 'MUSKARIT', image: 'images/home/muskarit.png', path: '' },
    { title: 'PELIT', image: 'images/home/pelit.png', path: '' },
    { title: 'KOULUTUS', image: 'images/home/koulutus.png', path: '' }
  ], [])

  useEffect(() => {
    const fetchLogo = async () => {
      const logoRef = ref(storage, 'images/common/logo.png')
      const url = await getDownloadURL(logoRef)
      setLogoUrl(url)
    }

    const fetchCategoryImages = async () => {
      const urls: { [key: string]: string } = {}
      for (const category of categories) {
        const imageRef = ref(storage, category.image)
        const url = await getDownloadURL(imageRef)
        urls[category.title] = url
      }
      setCategoryUrls(urls)
    }

    fetchLogo()
    fetchCategoryImages()
  }, [categories])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex justify-between px-2 bg-[#e9f1f3] py-2 z-10">
    <ArrowLeft 
      className="cursor-pointer" 
      size={45} 
      strokeWidth={3}
      onClick={() => router.push('/')}
    />
    <div className="w-[45px]" />
  </div>

  {logoUrl && (
  <div className="max-w-[900px] w-full m-0">
    <Image
      src={logoUrl}
      alt="Kielinuppu logo"
      width={900}
      height={225}
      className="w-auto h-auto object-contain m-0 p-0"
      priority
    />
  </div>
)}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mt-0">
        {categories.map((category) => (
          <div key={category.title}>
            {category.title === 'LAULUT' ? (
              <Link href={category.path}>
                <div className="w-[190px] sm:w-[170px] md:w-[190px] h-[190px] sm:h-[170px] md:h-[190px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] rounded-lg">
                  {categoryUrls[category.title] && (
                    <Image
                      src={categoryUrls[category.title]}
                      alt={category.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 170px, 190px"
                    />
                  )}
                </div>
              </Link>
            ) : (
              <div className="w-[190px] sm:w-[170px] md:w-[190px] h-[190px] sm:h-[170px] md:h-[190px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] rounded-lg">
                {categoryUrls[category.title] && (
                  <Image
                    src={categoryUrls[category.title]}
                    alt={category.title}
                    fill
                    className="object-cover rounded-lg opacity-40"
                    sizes="(max-width: 768px) 170px, 190px"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}