'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import ImageCarousel from './ImageCarousel'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  imageFiles?: string[] | null
  title?: string | null
}

export default function InfoModal({ isOpen, onClose, imageFiles, title }: InfoModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4"
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden transition-all duration-300 relative ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ boxShadow: 'rgba(0, 0, 0, 0.2) -4px 4px 4px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sulkunappi */}
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full bg-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Sisältö ilman otsikkoaluetta */}
        <div className="overflow-y-auto max-h-[85vh]">
          {imageFiles && imageFiles.length > 0 ? (
            <ImageCarousel 
              imageFiles={imageFiles}
              title={title || 'Info'}
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-500">Ei kuvia saatavilla</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}