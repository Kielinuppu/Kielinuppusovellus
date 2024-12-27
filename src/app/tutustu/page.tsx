'use client'

import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { getFullImageUrl } from '@/utils/imageUtils'

export default function TutustuPage() {
  const router = useRouter()
  const logoUrl = getFullImageUrl('logo.png', 'common')
  const mobileLogoUrl = getFullImageUrl('pienilogo.png', 'common')

  const categories = useMemo(() => [
    { 
      title: 'LAULUT', 
      imageUrl: getFullImageUrl('laulut.png', 'home'),
      path: '/tutustu/tutustu-aihe',
      active: true
    },
    { 
      title: 'HAKEMISTO', 
      imageUrl: getFullImageUrl('hakemisto.png', 'home'),
      path: '',
      active: false
    },
    { 
      title: 'SOITTOLISTAT', 
      imageUrl: getFullImageUrl('soitin.png', 'home'),
      path: '',
      active: false
    },
    { 
      title: 'MUSKARIT', 
      imageUrl: getFullImageUrl('muskarit.png', 'home'),
      path: '',
      active: false
    },
    { 
      title: 'PELIT', 
      imageUrl: getFullImageUrl('pelit.png', 'home'),
      path: '',
      active: false
    },
    { 
      title: 'KOULUTUS', 
      imageUrl: getFullImageUrl('koulutus.png', 'home'),
      path: '',
      active: false
    }
  ], [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      {/* Desktop: nuoli logon vieressä */}
      <div className="hidden md:block absolute left-6 top-6 z-20">
        <ArrowLeft 
          className="cursor-pointer"
          size={45}
          strokeWidth={3}
          onClick={() => router.push('/')}
        />
      </div>

      {/* Desktop logo */}
      <div className="hidden md:block max-w-[900px] w-full m-0">
        <QuickImage
          src={logoUrl}
          alt="Kielinuppu logo"
          width={900}
          height={225}
          priority={true}
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Mobiili: nuoli ja logo samalla rivillä */}
      <div className="sticky md:hidden top-0 w-full flex items-center justify-between px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer"
          size={45}
          strokeWidth={3}
          onClick={() => router.push('/')}
        />
        <div className="flex-1 max-w-[250px] mx-4">
          <QuickImage
            src={mobileLogoUrl}
            alt="Kielinuppu logo"
            width={400}
            height={100}
            priority={true}
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="w-[45px]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mt-0">
        {categories.map((category, index) => (
          <div key={category.title} className="flex justify-center">
            {category.active ? (
              <Link href={category.path}>
                <div className="w-[170px] h-[170px] sm:w-[180px] sm:h-[180px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] rounded-lg">
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
            ) : (
              <div className="w-[170px] h-[170px] sm:w-[180px] sm:h-[180px] relative shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] rounded-lg overflow-hidden">
                <QuickImage
                  src={category.imageUrl}
                  alt={category.title}
                  fill
                  priority={index < 4}
                  className="object-cover rounded-lg"
                  sizes="(max-width: 640px) 170px, 180px"
                />
                <div className="absolute inset-0 bg-white/60" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}