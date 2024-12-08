'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePlaylistModal({ isOpen, onClose }: CreatePlaylistModalProps) {
  const [playlistName, setPlaylistName] = useState('')
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playlistName.trim()) return

    try {
      const userCode = localStorage.getItem('userCode')
      if (!userCode) {
        console.error('Käyttäjää ei löydy')
        return
      }

      // Haetaan seuraava vapaa ID
      const playlistsRef = collection(db, 'soittolistat')
      const playlistsSnap = await getDocs(playlistsRef)
      const maxId = Math.max(...playlistsSnap.docs.map(doc => doc.data().ID || 0), 0)
      const newId = maxId + 1

      // Luodaan uusi soittolista
      const newPlaylist = {
        ID: newId,
        Name: playlistName,
        Lauluts: "",
        User: userCode,
        Created: new Date().toISOString(),
        Updated: new Date().toISOString()
      }

      // Tallennetaan Firebaseen
      await setDoc(doc(playlistsRef, newId.toString()), newPlaylist)

setPlaylistName('')
onClose()

// Siirry soittolista-sivulle
router.push(`/soittolistat/soittolista?id=${newId}`)

    } catch (error) {
      console.error('Virhe soittolistan luonnissa:', error)
    }
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
        <h2 className="text-3xl font-bold text-center">ANNA SOITTOLISTALLE NIMI</h2>
          
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
            <input
              type="text"
              placeholder="Soittolistan nimi"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full p-4 rounded-lg shadow-md focus:outline-none"
            />

            <button 
              type="submit"
              className="w-40 mx-auto block py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1] transition-colors"
            >
              LUO
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}