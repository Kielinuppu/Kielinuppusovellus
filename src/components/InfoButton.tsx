'use client'

import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import InfoModal from './InfoModal'
import { useInfoData } from '@/utils/infoUtils'

interface InfoButtonProps {
  category: string
  page: string
  className?: string
  autoOpen?: boolean // Käytetään "muut" kategorian automaattiseen avaamiseen
  delay?: number // Viive millisekunteina ennen avautumista
}

export default function InfoButton({ 
  category, 
  page, 
  className, 
  autoOpen = false,
  delay = 3000 // Oletusviive 3 sekuntia
}: InfoButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { data: infoData, loading } = useInfoData(category, page)

  // Avaa modaali automaattisesti, jos autoOpen on true
  useEffect(() => {
    if (autoOpen && infoData && !isModalOpen) {
      const timer = setTimeout(() => {
        setIsModalOpen(true)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [autoOpen, infoData, isModalOpen, delay])

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  if (loading || !infoData) {
    return null // Piilota nappi, jos dataa ei ole saatavilla
  }

  return (
    <>
      <button 
        className={`bg-white rounded-full p-2 shadow-md hover:bg-gray-100 ${className || ''}`}
        onClick={handleInfoClick}
        aria-label={`Info: ${infoData.title || category}`}
      >
        <Info size={24} className="text-blue-600" />
      </button>

      <InfoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        imageFiles={infoData.imageFiles}
        title={infoData.title}
      />
    </>
  )
}