'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PeliPage({
  params
}: {
  params: Promise<{ peliOsoite: string }>
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [peliUrl, setPeliUrl] = useState<string | null>(null)

  useEffect(() => {
    async function initParams() {
      const resolvedParams = await params
      if (resolvedParams.peliOsoite) {
        setPeliUrl(decodeURIComponent(resolvedParams.peliOsoite))
      }
    }
    initParams()
  }, [params])

  if (!peliUrl) {
    return (
      <div className="bg-[#e9f1f3] min-h-screen flex flex-col">
        <div className="w-full px-4 py-2">
          <ArrowLeft 
            className="cursor-pointer" 
            size={42} 
            strokeWidth={2}
            onClick={() => router.back()}
          />
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white rounded-[10px] p-6 shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] text-center">
            <div className="text-red-500 mb-4">
              <Gamepad2 size={48} />
            </div>
            <p className="text-red-600">Pelin osoitetta ei löytynyt</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#e9f1f3] min-h-screen flex flex-col">
      {/* Desktop: nuoli vasemmalla ylhäällä */}
      <div className="hidden md:block absolute left-6 top-2 z-20">
        <ArrowLeft 
          className="cursor-pointer"
          size={42}
          strokeWidth={2}
          onClick={() => router.back()}
        />
      </div>

      {/* Mobiili: nuoli stickynä */}
      <div className="sticky md:hidden top-0 w-full flex px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer"
          size={42}
          strokeWidth={2}
          onClick={() => router.back()}
        />
      </div>

      <div className="flex-1 px-4 pb-4 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-[10px]"> 
            {isLoading && (
              <div className="absolute inset-0 bg-white z-10" />
            )}
            <iframe
              src={peliUrl}
              className="w-full min-h-[calc(100vh-70px)]" 
              style={{
                border: 'none',
                backgroundColor: '#FFFFFF'
              }}
              title="Peli"
              allow="fullscreen"
              scrolling="auto" 
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}