'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '../../../lib/firebase'
import { collection, query, getDocs, addDoc, orderBy, limit } from 'firebase/firestore'

interface Game {
  ID: number
  Laulut: string
  Name: string
  "Pelin osoite": string
  "mikä pelilaji": number
}

interface Activity {
  ID: number
  Kuva?: string
  Name: string
  TYYLI: string
  "Pelin osoite"?: string
  Määrittäjä?: number | string
  tunnusluku?: number
  Lauluts?: string[] | string
}

export default function DatabasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState<string | null>(null)
  
  // Pelilomakkeen kentät
  const [gameName, setGameName] = useState('')
  const [songName, setSongName] = useState('')
  const [gameUrl, setGameUrl] = useState('')
  const [gameType, setGameType] = useState<number>(1)
  const [recentGames, setRecentGames] = useState<Game[]>([])

  // Tekeminen-lomakkeen kentät
  const [activityName, setActivityName] = useState('')
  const [activityStyle, setActivityStyle] = useState('')
  const [activityUrl, setActivityUrl] = useState('')
  const [activityIdentifier, setActivityIdentifier] = useState<number>(1)
  const [activityCode, setActivityCode] = useState<number>(1)
  const [laulutsType, setLaulutsType] = useState<'single' | 'array'>('single')
  const [singleLaulut, setSingleLaulut] = useState<string>('')
  const [multipleLaulut, setMultipleLaulut] = useState<string[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])

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
    fetchGames()
    fetchActivities()
  }, [router])

  // Pelien haku
  const getNextGameId = async () => {
    const gamesRef = collection(db, 'pelit')
    const q = query(gamesRef, orderBy('ID', 'desc'), limit(1))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const lastId = snapshot.docs[0].data().ID
      return lastId + 1
    }
    return 1
  }

  const fetchGames = async () => {
    const gamesRef = collection(db, 'pelit')
    const q = query(gamesRef, orderBy('ID', 'desc'), limit(10))
    const snapshot = await getDocs(q)
    
    const games = snapshot.docs.map(doc => ({
      ID: doc.data().ID,
      Laulut: doc.data().Laulut,
      Name: doc.data().Name,
      "Pelin osoite": doc.data()["Pelin osoite"],
      "mikä pelilaji": doc.data()["mikä pelilaji"]
    }))

    setRecentGames(games)
  }

  // Tekemisten haku
  const getNextActivityId = async () => {
    const activitiesRef = collection(db, 'tekeminen')
    const q = query(activitiesRef, orderBy('ID', 'desc'), limit(1))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const lastId = snapshot.docs[0].data().ID
      return lastId + 1
    }
    return 1
  }

  const fetchActivities = async () => {
    const activitiesRef = collection(db, 'tekeminen')
    const q = query(activitiesRef, orderBy('ID', 'desc'), limit(10))
    const snapshot = await getDocs(q)
    
    const activities = snapshot.docs.map(doc => ({
      ID: doc.data().ID,
      Name: doc.data().Name,
      TYYLI: doc.data().TYYLI,
      "Pelin osoite": doc.data()["Pelin osoite"],
      Määrittäjä: doc.data().Määrittäjä,
      tunnusluku: doc.data().tunnusluku,
      Lauluts: doc.data().Lauluts
    }))

    setRecentActivities(activities)
  }

  // Pelien lisäys
  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const nextId = await getNextGameId()
      await addDoc(collection(db, 'pelit'), {
        ID: nextId,
        Laulut: songName,
        Name: gameName,
        "Pelin osoite": gameUrl,
        "mikä pelilaji": gameType
      })

      setGameName('')
      setSongName('')
      setGameUrl('')
      setGameType(1)
      fetchGames()
      
      alert('Peli lisätty onnistuneesti!')
    } catch (error) {
      console.error('Error adding game:', error)
      alert('Virhe pelin lisäämisessä!')
    }
  }

  // Tekemisten lisäys
  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const nextId = await getNextActivityId()
      await addDoc(collection(db, 'tekeminen'), {
        ID: nextId,
        Name: activityName,
        TYYLI: activityStyle,
        "Pelin osoite": activityUrl,
        Määrittäjä: activityIdentifier,
        tunnusluku: activityCode,
        Lauluts: laulutsType === 'single' ? singleLaulut : multipleLaulut,
        Created: new Date().toISOString(),
        Updated: new Date().toISOString(),
        Kuva: ""
      })

      setActivityName('')
      setActivityStyle('')
      setActivityUrl('')
      setActivityIdentifier(1)
      setActivityCode(1)
      setSingleLaulut('')
      setMultipleLaulut([])
      fetchActivities()
      
      alert('Tekeminen lisätty onnistuneesti!')
    } catch (error) {
      console.error('Error adding activity:', error)
      alert('Virhe tekemisen lisäämisessä!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9f1f3] flex items-center justify-center">
        <div className="text-2xl">Ladataan...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e9f1f3] p-4">
      <div className="sticky top-0 flex justify-between items-center mb-6">
        <ArrowLeft 
          className="cursor-pointer" 
          size={45} 
          strokeWidth={3}
          onClick={() => router.push('/admin')}
        />
        <h1 className="text-4xl font-bold">TIETOKANNAN HALLINTA</h1>
        <div className="w-[45px]" />
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Kategoriavalinta */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveForm('pelit')}
              className={`py-3 rounded-lg font-bold shadow-md ${
                activeForm === 'pelit' ? 'bg-blue-500 text-white' : 'bg-[#F6F7E7]'
              }`}
            >
              PELIT
            </button>
            <button
              onClick={() => setActiveForm('tekeminen')}
              className={`py-3 rounded-lg font-bold shadow-md ${
                activeForm === 'tekeminen' ? 'bg-blue-500 text-white' : 'bg-[#F6F7E7]'
              }`}
            >
              TEKEMINEN
            </button>
          </div>
        </div>

        {/* Pelien lisäyslomake */}
        {activeForm === 'pelit' && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Lisää uusi peli</h2>
            <form onSubmit={handleGameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Laulun nimi</label>
                <input
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Pelin nimi</label>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Pelin osoite</label>
                <input
                  type="url"
                  value={gameUrl}
                  onChange={(e) => setGameUrl(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Pelilaji</label>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(Number(e.target.value))}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value={1}>1 - Peruslaji</option>
                  <option value={2}>2 - Toinen laji</option>
                  <option value={3}>3 - Kolmas laji</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1]"
              >
                LISÄÄ PELI
              </button>
            </form>
          </div>
        )}

        {/* Tekeminen-lomake */}
        {activeForm === 'tekeminen' && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Lisää uusi tekeminen</h2>
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Nimi</label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
        <label className="block text-sm font-bold mb-2">Tyyli</label>
        <select
          value={activityStyle}
          onChange={(e) => setActivityStyle(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        >
          <option value="">Valitse tyyli</option>
          <option value="MP3">MP3</option>
          <option value="KARAOKE">KARAOKE</option>
          <option value="TULOSTEET">TULOSTEET</option>
          <option value="NUOTIT">NUOTIT</option>
          <option value="LAULUPELI">LAULUPELI</option>
          <option value="SANAPELI">SANAPELI</option>
          <option value="MUISTIPELI">MUISTIPELI</option>
          <option value="MUSKARI">MUSKARI</option>
          <option value="VALINTAPELI">VALINTAPELI</option>
        </select>
      </div>

              <div>
                <label className="block text-sm font-bold mb-2">Pelin osoite (valinnainen)</label>
                <input
                  type="url"
                  value={activityUrl}
                  onChange={(e) => setActivityUrl(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Määrittäjä</label>
                <input
                  type="number"
                  value={activityIdentifier}
                  onChange={(e) => setActivityIdentifier(Number(e.target.value))}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Tunnusluku</label>
                <input
                  type="number"
                  value={activityCode}
                  onChange={(e) => setActivityCode(Number(e.target.value))}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Laulut-tyypin valinta</label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setLaulutsType('single')}
                    className={`flex-1 py-2 px-4 rounded-lg ${
                      laulutsType === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    Yksittäinen laulu
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaulutsType('array')}
                    className={`flex-1 py-2 px-4 rounded-lg ${
                      laulutsType === 'array' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    Useita lauluja
                  </button>
                </div>

                {laulutsType === 'single' ? (
                  <div>
                    <label className="block text-sm font-bold mb-2">Laulu</label>
                    <input
                      type="text"
                      value={singleLaulut}
                      onChange={(e) => setSingleLaulut(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Syötä laulun numero"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold mb-2">Laulut</label>
                    <select
                      multiple
                      value={multipleLaulut}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value)
                        setMultipleLaulut(values)
                      }}
                      className="w-full p-3 border rounded-lg h-32"
                    >
                      {[...Array(58)].map((_, i) => (
                        <option key={i+1} value={(i+1).toString()}>
                          Laulu {i+1}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Voit valita useita pitämällä Ctrl (Windows) tai Cmd (Mac) pohjassa
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1]"
              >
                LISÄÄ TEKEMINEN
              </button>
            </form>
          </div>
        )}

        {/* Viimeksi lisätyt listaukset */}
        {activeForm === 'pelit' && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">Viimeksi lisätyt pelit</h2>
            <div className="space-y-4">
              {recentGames.map((game) => (
                <div key={game.ID} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold">{game.Name}</div>
                  <div>Laulu: {game.Laulut}</div>
                  <div className="text-sm text-blue-600 truncate">
                    <a href={game["Pelin osoite"]} target="_blank" rel="noopener noreferrer">
                      {game["Pelin osoite"]}
                    </a>
                  </div>
                  <div className="text-sm text-gray-500">Pelilaji: {game["mikä pelilaji"]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeForm === 'tekeminen' && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">Viimeksi lisätyt tekemiset</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.ID} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold">{activity.Name}</div>
                  <div>Tyyli: {activity.TYYLI}</div>
                  {activity["Pelin osoite"] && (
                    <div className="text-sm text-blue-600 truncate">
                      <a href={activity["Pelin osoite"]} target="_blank" rel="noopener noreferrer">
                        {activity["Pelin osoite"]}
                      </a>
                    </div>
                  )}
                  <div>Määrittäjä: {activity.Määrittäjä}</div>
                  <div>Tunnusluku: {activity.tunnusluku}</div>
                  <div>
                    Laulut: {Array.isArray(activity.Lauluts) 
                      ? activity.Lauluts.join(', ') 
                      : activity.Lauluts}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}