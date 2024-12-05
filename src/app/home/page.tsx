'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import { useEffect, useState, useMemo } from 'react'
import LogoutModal from '../components/LogoutModal'

export default function HomePage() {
 const router = useRouter()
 const [logoUrl, setLogoUrl] = useState('')
 const [categoryUrls, setCategoryUrls] = useState<{ [key: string]: string }>({})
 const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
 const [isAdmin, setIsAdmin] = useState(false)

 const categories = useMemo(() => [
   { title: 'LAULUT', image: 'images/home/laulut.png', path: '/aiheet' },
   { title: 'HAKEMISTO', image: 'images/home/hakemisto.png', path: '/hakemisto' },
   { title: 'SOITTOLISTAT', image: 'images/home/soitin.png', path: '/soittolistat' },
   { title: 'MUSKARIT', image: 'images/home/muskarit.png', path: '/muskarit' },
   { title: 'PELIT', image: 'images/home/pelit.png', path: '/pelit' },
   { title: 'KOULUTUS', image: 'images/home/koulutus.png', path: '/koulutus' },
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

 // Kuvien hakeminen
 useEffect(() => {
   const fetchLogo = async () => {
     try {
       const logoRef = ref(storage, 'images/common/logo.png')
       const url = await getDownloadURL(logoRef)
       setLogoUrl(url)
     } catch (error) {
       console.error('Error fetching logo:', error)
     }
   }

   const fetchCategoryImages = async () => {
     try {
       const urls: { [key: string]: string } = {}
       for (const category of categories) {
         const imageRef = ref(storage, category.image)
         const url = await getDownloadURL(imageRef)
         urls[category.title] = url
       }
       setCategoryUrls(urls)
     } catch (error) {
       console.error('Error fetching category images:', error)
     }
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
          onClick={() => router.push('/home')}
        />
        <LogOut 
          size={45} 
          className="cursor-pointer"
          onClick={() => setIsLogoutModalOpen(true)}
        />
      </div>

    {logoUrl && (
 <div className="max-w-[900px] w-full m-0"> {/* Isompi maxWidth ja m-0 */}
   <Image
     src={logoUrl}
     alt="Kielinuppu logo"
     width={900}      // Isompi width 
     height={225}     // Suhteutettu height
     className="w-auto h-auto object-contain m-0 p-0" // Lisätty m-0 p-0
     priority
   />
 </div>
)}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mt-0">
        {categories.map((category) => (
          <Link href={category.path} key={category.title}>
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