'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        console.log('Fetching logo...')
        const logoRef = ref(storage, 'images/common/logo.png')
        console.log('Logo ref:', logoRef)
        const url = await getDownloadURL(logoRef)
        console.log('Got URL:', url)
        setLogoUrl(url)
      } catch (error) {
        console.error('Error fetching logo:', error)
      }
    }
  
    fetchLogo()
  }, [])

  return (
    <div className="min-h-screen bg-[#e9f1f3] flex flex-col items-center justify-start">
  <div className="mb-20 mt-20">
  {logoUrl && (
  // 1. Korjataan Image import
  // 2. Käytetään next/image komponenttia oikein
  <Image
    src={logoUrl}
    alt="Kielinuppu logo"
    width={1000}
    height={250}
    className="mb-2"
    priority
  />
)}
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