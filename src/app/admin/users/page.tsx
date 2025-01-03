'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Search, Lock, Unlock } from 'lucide-react'
import { db } from '../../../lib/firebase'
import { collection, query, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'

interface User {
  id: string
  Koodi: string
  Päiväkoti: string
  Created: Date
  last_used: Date | null
  Access: string
}

export default function UsersManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Admin-tarkistus
  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (!userData) {
      router.push('/login')
      return
    }

    const user = JSON.parse(userData)
    if (user.Admin !== 'TRUE') {
      router.push('/home')
      return
    }

    setLoading(false)
  }, [router])

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'kayttajat')
      const q = query(usersRef, orderBy('Created', 'desc'))
      const snapshot = await getDocs(q)
      
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        Created: new Date(doc.data().Created),
        last_used: doc.data().last_used ? new Date(doc.data().last_used) : null
      })) as User[]

      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const updateAccess = async (userId: string, currentAccess: string) => {
    try {
      const userRef = doc(db, 'kayttajat', userId)
      // Jos Access on TRUE, asetetaan FALSE, muuten TRUE
      const newAccess = currentAccess === 'TRUE' ? 'FALSE' : 'TRUE'
      
      await updateDoc(userRef, {
        Access: newAccess
      })
      
      await fetchUsers() // Päivitä lista
      alert(`Käyttäjän pääsy ${newAccess === 'TRUE' ? 'aktivoitu' : 'estetty'} onnistuneesti!`)
    } catch (error) {
      console.error('Error updating access:', error)
      alert('Virhe pääsyn päivittämisessä!')
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchUsers()
    }
  }, [loading])

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'kayttajat', userId))
      setShowDeleteConfirm(null)
      fetchUsers()
      alert('Käyttäjä poistettu onnistuneesti!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Virhe käyttäjän poistamisessa!')
    }
  }

  const filteredUsers = users.filter(user => 
    user.Päiväkoti.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.Koodi.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
        <div className="text-2xl">Ladataan...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] p-4">
      <div className="sticky top-0 flex justify-between items-center mb-6 bg-[#e9f1f3] py-2">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/admin')}
        />
        <h1 className="text-4xl font-bold">KÄYTTÄJIEN HALLINTA</h1>
        <div className="w-[45px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Hae käyttäjää tai koodia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 bg-gray-50 rounded-lg relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{user.Päiväkoti}</div>
                    <div className="font-mono text-lg">{user.Koodi}</div>
                    <div className="text-sm text-gray-500">
                      Luotu: {user.Created.toLocaleDateString()}
                    </div>
                    {user.last_used && (
                      <div className="text-sm text-gray-500">
                        Viimeksi käytetty: {user.last_used.toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        user.Access === 'TRUE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.Access === 'TRUE' ? 'Aktiivinen' : 'Estetty'}
                      </div>
                      <button
                        onClick={() => updateAccess(user.id, user.Access)}
                        className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${
                          user.Access === 'TRUE' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {user.Access === 'TRUE' ? <Lock size={20} /> : <Unlock size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {showDeleteConfirm === user.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Vahvista
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Peruuta
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(user.id)}
                      className="text-red-500 p-2 rounded-full hover:bg-red-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}