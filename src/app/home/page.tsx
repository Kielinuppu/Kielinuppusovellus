'use client'

import QuickImage from '@/components/QuickImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import LogoutModal from '../components/LogoutModal'
import { getFullImageUrl } from '@/utils/imageUtils'

export default function HomePage() {
  const router = useRouter()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const logoUrl = getFullImageUrl('logo.png', 'common')

  // Määritellään kategoriat ja niiden kuvat
  const categories = useMemo(() => [
    { 
      title: 'LAULUT', 
      imageUrl: getFullImageUrl('laulut.png', 'home'), 
      path: '/aiheet' 
    },
    { 
      title: 'HAKEMISTO', 
      imageUrl: getFullImageUrl('hakemisto.png', 'home'), 
      path: '/hakemisto' 
    },
    { 
      title: 'SOITTOLISTAT', 
      imageUrl: getFullImageUrl('soitin.png', 'home'), 
      path: '/soittolistat' 
    },
    { 
      title: 'MUSKARIT', 
      imageUrl: getFullImageUrl('muskarit.png', 'home'), 
      path: '/muskarit' 
    },
    { 
      title: 'PELIT', 
      imageUrl: getFullImageUrl('pelit.png', 'home'), 
      path: '/pelit' 
    },
    { 
      title: 'KOULUTUS', 
      imageUrl: getFullImageUrl('koulutus.png', 'home'), 
      path: '/koulutus' 
    },
  ], [])

  // Admin-tarkistus
  useEffect(() => {
    const checkAdminStatus = () => {
      const userData = localStorage.getItem('userData')
      if (userData) {
        const user = JSON.parse(userData)
        setIsAdmin(user.Admin === 'TRUE')
      }
    }

    checkAdminStatus()
  }, [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center p-4 pt-2">
      <div className="sticky top-0 w-full flex justify-between px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/home')}
        />
        <LogOut 
          size={45} 
          className="cursor-pointer"
          onClick={() => setIsLogoutModalOpen(true)}
        />
      </div>

      {logoUrl && (
        <div className="max-w-[900px] w-full m-0">
          <QuickImage
            src={logoUrl}
            alt="Kielinuppu logo"
            width={900}
            height={225}
            priority={true}
            className="w-full h-auto object-contain"
          />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mt-0">
        {categories.map((category, index) => (
          <Link href={category.path} key={category.title} className="flex justify-center">
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
        ))}
      </div>

      {isAdmin && (
        <button 
          onClick={() => router.push('/admin')}
          className="fixed bottom-4 right-4 bg-[#F6F7E7] p-4 rounded-full shadow-md hover:bg-[#F0F1E1] transition-colors"
        >
          ADMIN
        </button>
      )}

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  )
}