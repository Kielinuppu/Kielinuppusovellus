'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import CreatePlaylistModal from './components/CreatePlaylistModal'
import AudioPlayer from './components/player/AudioPlayer'

interface Playlist {
  id: number;
  name: string;
}

const PlaylistsPage = () => {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaylists = async () => {
      const userCode = localStorage.getItem('userCode')
      if (!userCode) return

      const playlistsRef = collection(db, 'soittolistat')
      const q = query(playlistsRef, where('User', '==', userCode))
      const querySnapshot = await getDocs(q)
      
      const playlistsData = querySnapshot.docs.map(doc => ({
        id: doc.data().ID,
        name: doc.data().Name
      }))

      setPlaylists(playlistsData)
    }

    fetchPlaylists()
  }, [])

  const handleEdit = (id: number) => {
    router.push(`/soittolistat/soittolista?id=${id}`)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'soittolistat', id.toString()))
      setPlaylists(currentPlaylists => 
        currentPlaylists.filter(playlist => playlist.id !== id)
      )
    } catch (error) {
      console.error('Virhe poistossa:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] p-4">
      <div className="sticky top-0 flex justify-between items-center mb-6">
        <ArrowLeft 
          className="cursor-pointer text-black" 
          size={42} 
          strokeWidth={2}
          onClick={() => router.push('/home')}  
        />
        <h1 className="text-[26px] sm:text-3xl md:text-4xl font-bold text-center">OMAT SOITTOLISTAT</h1>
        <div 
          className="w-12 h-12 rounded-full bg-[#F6F7E7] flex items-center justify-center cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus
            className="text-black"
            size={30}
            strokeWidth={3}
          />
        </div>
      </div>
 
      <div className="space-y-2 sm:space-y-4 w-full sm:max-w-[80%] md:max-w-[50%] mx-auto">
        {playlists.map((playlist) => (
          <div 
            key={playlist.id}
            onClick={() => {
              setActivePlaylistId(playlist.id.toString())
              setIsPlayerOpen(true)
            }}
            className="bg-white rounded-lg h-[65px] sm:h-[75px] flex items-center justify-between px-4 shadow-[rgba(0,0,0,0.2)_-4px_4px_4px] cursor-pointer hover:bg-gray-50"
          >
            <span className="text-[14px] sm:text-lg truncate max-w-[calc(100%-90px)]">{playlist.name}</span>
            <div className="flex space-x-4">
              <Edit
                className="cursor-pointer text-black"
                size={24}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleEdit(playlist.id)
                }}
              />
              <Trash2
                className="cursor-pointer text-black"
                size={24}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleDelete(playlist.id)
                }}
              />
            </div>
          </div>
        ))}
      </div>
 
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
 
      {isPlayerOpen && (
        <AudioPlayer
          playlistId={activePlaylistId}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
 )
}

export default PlaylistsPage