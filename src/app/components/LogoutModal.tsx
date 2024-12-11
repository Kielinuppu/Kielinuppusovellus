'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogout = () => {
    // Poistetaan käyttäjätiedot localStorage:sta
    localStorage.removeItem('userCode')
    localStorage.removeItem('userData')
    
    // Poistetaan cookie
    document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    // Suljetaan modaali ja ohjataan login-sivulle
    onClose()
    router.push('/login')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#e9f1f3] rounded-lg w-full max-w-2xl p-8 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X size={24} className="text-black" />
        </button>

        <div className="flex flex-col items-center space-y-8">
        <h2 className="text-3xl font-bold text-center max-w-lg mx-auto">HALUATKO KIRJAUTUA ULOS?</h2>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleLogout}
              className="w-40 py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1] transition-colors"
            >
              KIRJAUDU ULOS
            </button>
            <button 
              onClick={onClose}
              className="w-40 py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1] transition-colors"
            >
              PERUUTA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}