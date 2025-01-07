'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileText, MousePointer2, Printer } from 'lucide-react' // Lisätään Printer
import { storage } from '@/lib/firebase'
import { ref, getDownloadURL } from 'firebase/storage'

function ViewerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const url = searchParams.get('url')
  const type = searchParams.get('type')
  const title = searchParams.get('title')

  // Lisätään tulostustoiminto
  const handlePrint = () => {
    if (!pdfUrl) return
    window.open(pdfUrl, '_blank')
  }

  const formatTitle = (title: string | null) => {
    if (!title) return ''
    return decodeURIComponent(title).split('\\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index === 0 && <br />}
      </React.Fragment>
    ))
  }

  useEffect(() => {
    const getPdfUrl = async () => {
      if (type === 'pdf' && url) {
        try {
          const pdfRef = ref(storage, url)
          const downloadUrl = await getDownloadURL(pdfRef)
          setPdfUrl(downloadUrl)
        } catch (error) {
          console.error('Error getting PDF URL:', error)
          setError('PDF-tiedoston lataus epäonnistui')
        }
      }
    }

    getPdfUrl()
  }, [type, url])

  if (!url || !type) {
    return <div>Invalid parameters</div>
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] p-4 pt-2">
      <div className="sticky top-0 w-full flex items-center px-2 bg-[#e9f1f3] py-2 z-10">
        <ArrowLeft 
          className="cursor-pointer" 
          size={42} 
          strokeWidth={2}
          onClick={() => router.back()}
        />
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-semibold">
            {formatTitle(title)}
          </h1>
          {/* Näytetään ohje vain PDF:lle */}
          {type === 'pdf' && pdfUrl && (
            <div className="hidden md:flex items-center justify-center gap-2 mt-2 text-gray-600">
              <MousePointer2 size={16} />
              <span className="text-sm">
              Paina hiiren oikeaa näppäintä tai käytä yläkulman painikketta tallentaaksesi tai tulostaaksesi.
              </span>
            </div>
          )}
        </div>
        {/* Tulostuspainike näkyy vain PDF:lle */}
        {type === 'pdf' && pdfUrl ? (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F6F7E7] text-black hover:bg-opacity-80 transition-colors"
            aria-label="Tulosta PDF"
          >
            <Printer size={20} />
            <span className="hidden md:inline">Tulosta</span>
          </button>
        ) : (
          <div className="w-[45px]"></div>
        )}
      </div>

      <div className="max-w-[80%] mx-auto mt-4">
        {error ? (
          <div className="bg-white rounded-[10px] p-6 shadow-[rgba(0,0,0,0.4)_-4px_4px_4px] text-center">
            <div className="text-red-500 mb-4">
              <FileText size={48} />
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[10px] p-4 shadow-[rgba(0,0,0,0.4)_-4px_4px_4px]">
            {type === 'video' ? (
              <div className="relative w-full pt-[56.25%]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={url}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : type === 'pdf' && pdfUrl ? (
              <div className="w-full aspect-[1.4/1] relative">
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  className="w-full h-full rounded-lg"
                  title={title || 'PDF'}
                  allowFullScreen
                />
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
        <div>Ladataan...</div>
      </div>
    }>
      <ViewerContent />
    </Suspense>
  )
}