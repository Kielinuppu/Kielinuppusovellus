'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import QuickImage from '@/components/QuickImage'
import { getFullImageUrl } from '@/utils/imageUtils'

interface ImageCarouselProps {
  imageFiles: string[]
  title?: string
}

export default function ImageCarousel({ 
  imageFiles,
  title = 'Info'
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Jos kuvia on vain yksi, älä näytä nuolia
  const showControls = imageFiles.length > 1

  const goToPrevious = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev === 0 ? imageFiles.length - 1 : prev - 1))
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300) // Transition kestää 300ms
  }

  const goToNext = () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev === imageFiles.length - 1 ? 0 : prev + 1))
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  // Kosketuspyyhkäisyn käsittely mobiililaitteille
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || !showControls) return
    
    const touchEndX = e.touches[0].clientX
    const diff = touchStartX - touchEndX
    
    // Jos pyyhkäisy on tarpeeksi pitkä, vaihda kuva
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Pyyhkäisy vasemmalle -> seuraava kuva
        goToNext()
      } else {
        // Pyyhkäisy oikealle -> edellinen kuva
        goToPrevious()
      }
      setTouchStartX(null)
    }
  }

  const handleTouchEnd = () => {
    setTouchStartX(null)
  }

  // Jos kuvien lista muuttuu, varmista että currentIndex on sallituissa rajoissa
  useEffect(() => {
    if (currentIndex >= imageFiles.length) {
      setCurrentIndex(0)
    }
  }, [imageFiles, currentIndex])

  if (!imageFiles || imageFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Ei kuvia saatavilla</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Kuva-alue, jossa kuva on */}
      <div 
        className="relative w-full" 
        style={{ height: '65vh' }}
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full overflow-hidden">
          <div 
            className={`relative w-full h-full transition-transform duration-300 ${
              isTransitioning ? 'opacity-50' : 'opacity-100'
            }`}
          >
            <QuickImage
              src={getFullImageUrl(imageFiles[currentIndex], 'infokuvat')}
              alt={`${title} - kuva ${currentIndex + 1}/${imageFiles.length}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </div>
      </div>

      {/* Erillinen alue navigointinapeille ja indikaattoreille */}
      {showControls && (
        <div className="py-4 bg-white flex justify-center items-center space-x-4">
          {/* Vasen nuoli */}
          <button 
            onClick={goToPrevious}
            className="bg-white rounded-full p-1 shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:bg-gray-100"
            aria-label="Edellinen kuva"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Indikaattoripisteet */}
          <div className="flex space-x-3">
            {imageFiles.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentIndex(index)
                    setTimeout(() => {
                      setIsTransitioning(false)
                    }, 300)
                  }
                }}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Siirry kuvaan ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Oikea nuoli */}
          <button 
            onClick={goToNext}
            className="bg-white rounded-full p-1 shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] hover:bg-gray-100"
            aria-label="Seuraava kuva"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  )
}