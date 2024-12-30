'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { db } from '../../lib/firebase'
import { collection, query, getDocs, addDoc, orderBy, limit } from 'firebase/firestore'

interface Code {
 Koodi: string
 Päiväkoti: string
 Created: Date
}

export default function AdminPage() {
 const router = useRouter()
 const [loading, setLoading] = useState(true)
 const [name, setName] = useState('')
 const [groupCount, setGroupCount] = useState<number>(0)
 const [codesPerGroup, setCodesPerGroup] = useState<number>(1)
 const [isGroupMode, setIsGroupMode] = useState(false)
 const [groupedCodes, setGroupedCodes] = useState<{[key: string]: string[]}>({})
 const [recentCodes, setRecentCodes] = useState<Code[]>([])

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

 const generateCode = () => {
   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
   let result = ''
   for (let i = 0; i < 8; i++) {
     result += chars.charAt(Math.floor(Math.random() * chars.length))
   }
   return result
 }

 const fetchCodes = async () => {
   const usersRef = collection(db, 'kayttajat')
   const q = query(usersRef, orderBy('Created', 'desc'), limit(120))
   const snapshot = await getDocs(q)
   
   const codes = snapshot.docs.map(doc => ({
     Koodi: doc.data().Koodi,
     Päiväkoti: doc.data().Päiväkoti,
     Created: new Date(doc.data().Created)
   }))

   setRecentCodes(codes)

   const grouped: {[key: string]: string[]} = {}
   codes.forEach(code => {
     if (!grouped[code.Päiväkoti]) {
       grouped[code.Päiväkoti] = []
     }
     grouped[code.Päiväkoti].push(code.Koodi)
   })
   setGroupedCodes(grouped)
 }

 useEffect(() => {
   if (!loading) {
     fetchCodes()
   }
 }, [loading])

 const getNextId = async () => {
   const usersRef = collection(db, 'kayttajat')
   const q = query(usersRef, orderBy('ID', 'desc'), limit(1))
   const snapshot = await getDocs(q)
   if (!snapshot.empty) {
     const lastId = snapshot.docs[0].data().ID
     return lastId + 1
   }
   return 1
 }

 const createCodes = async () => {
   if (!name) return

   try {
     if (isGroupMode && groupCount > 0) {
       for (let group = 1; group <= groupCount; group++) {
         const groupName = `${name} RYHMÄ ${group}`
         for (let i = 0; i < codesPerGroup; i++) {
           const nextId = await getNextId()
           await addDoc(collection(db, 'kayttajat'), {
             ID: nextId,
             Koodi: generateCode(),
             Päiväkoti: groupName,
             Created: new Date().toISOString(),
             Updated: new Date().toISOString(),
             Access: "TRUE",
             Admin: "FALSE",
             Password: "",
             Username: "",
             "Nyt soi": "",
             last_used: null
           })
         }
       }
     } else {
       for (let i = 0; i < codesPerGroup; i++) {
         const nextId = await getNextId()
         await addDoc(collection(db, 'kayttajat'), {
           ID: nextId,
           Koodi: generateCode(),
           Päiväkoti: name,
           Created: new Date().toISOString(),
           Updated: new Date().toISOString(),
           Access: "TRUE",
           Admin: "FALSE",
           Password: "",
           Username: "",
           "Nyt soi": "",
           last_used: null
         })
       }
     }
     setName('')
     setGroupCount(0)
     setCodesPerGroup(1)
     fetchCodes()
   } catch (error) {
     console.error('Error creating codes:', error)
   }
 }

 const formatCodesForCopy = () => {
   let formattedText = ''
   Object.entries(groupedCodes).forEach(([group, codes]) => {
     const cleanGroupName = group.replace(/['"]+/g, '')
     formattedText += `${cleanGroupName}\n`  
     codes.forEach(code => {
       formattedText += `${code}\n`
     })
     formattedText += '\n'  
   })
   return formattedText
 }

 const copyToClipboard = async () => {
   try {
     await navigator.clipboard.writeText(formatCodesForCopy())
     alert('Koodit kopioitu leikepöydälle!')
   } catch (error) {
     console.error('Kopiointi epäonnistui:', error)
   }
 }

 const downloadTextFile = () => {
   const element = document.createElement('a')
   const file = new Blob([formatCodesForCopy()], {type: 'text/plain'})
   element.href = URL.createObjectURL(file)
   element.download = 'kielinuppu_koodit.txt'
   document.body.appendChild(element)
   element.click()
   document.body.removeChild(element)
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
         onClick={() => router.push('/home')}
       />
       <h1 className="text-4xl font-bold">KÄYTTÄJIEN HALLINTA</h1>
       <div className="w-[45px]" />
     </div>

     <div className="max-w-2xl mx-auto space-y-8">
       {/* Hallinta painikkeet */}
       <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
         <button
           onClick={() => router.push('/admin/tietokanta')}
           className="w-full py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1]"
         >
           TIETOKANNAN HALLINTA
         </button>
         <button
           onClick={() => router.push('/admin/users')}
           className="w-full py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1]"
         >
           KÄYTTÄJIEN HALLINTA
         </button>
       </div>

       <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
         <input
           type="text"
           placeholder={isGroupMode ? "Päiväkodin nimi" : "Käyttäjän nimi"}
           value={name}
           onChange={(e) => setName(e.target.value)}
           className="w-full p-3 border rounded-lg"
         />

         <div className="flex gap-4">
           <button
             onClick={() => setIsGroupMode(false)}
             className={`flex-1 py-3 rounded-lg font-bold shadow-md 
               ${!isGroupMode ? 'bg-blue-500 text-white' : 'bg-[#F6F7E7]'}`}
           >
             YKSITTÄINEN
           </button>
           <button
             onClick={() => setIsGroupMode(true)}
             className={`flex-1 py-3 rounded-lg font-bold shadow-md
               ${isGroupMode ? 'bg-blue-500 text-white' : 'bg-[#F6F7E7]'}`}
           >
             RYHMÄT
           </button>
         </div>

         <div className="flex gap-4">
           {isGroupMode && (
             <div className="flex-1">
               <label className="block text-sm font-bold mb-2">Ryhmien määrä</label>
               <select 
                 value={groupCount}
                 onChange={(e) => setGroupCount(Number(e.target.value))}
                 className="w-full p-3 border rounded-lg"
               >
                 {[...Array(10)].map((_, i) => (
                   <option key={i+1} value={i+1}>{i+1}</option>
                 ))}
               </select>
             </div>
           )}
           
           <div className="flex-1">
             <label className="block text-sm font-bold mb-2">
               {isGroupMode ? 'Koodit per ryhmä' : 'Koodien määrä'}
             </label>
             <select 
               value={codesPerGroup}
               onChange={(e) => setCodesPerGroup(Number(e.target.value))}
               className="w-full p-3 border rounded-lg"
             >
               {[...Array(10)].map((_, i) => (
                 <option key={i+1} value={i+1}>{i+1}</option>
               ))}
             </select>
           </div>
         </div>

         <button
           onClick={createCodes}
           className="w-full py-3 bg-[#F6F7E7] rounded-lg font-bold shadow-md hover:bg-[#F0F1E1]"
         >
           LUO KOODIT
         </button>
       </div>

       <div className="bg-white rounded-lg p-6 shadow-md">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold">Viimeksi luodut koodit</h2>
           <div className="flex gap-4">
             <button
               onClick={copyToClipboard}
               className="bg-[#F6F7E7] px-4 py-2 rounded-lg font-bold shadow-md hover:bg-[#F0F1E1]"
             >
               Kopioi leikepöydälle
             </button>
             <button
               onClick={downloadTextFile}
               className="bg-[#F6F7E7] px-4 py-2 rounded-lg font-bold shadow-md hover:bg-[#F0F1E1]"
             >
               Lataa tekstitiedosto
             </button>
           </div>
         </div>

         <div className="space-y-4">
           {recentCodes.map((code, index) => (
             <div key={index} className="p-3 bg-gray-50 rounded-lg">
               <div className="text-sm text-gray-500">
                 {code.Created.toLocaleDateString()} {code.Created.toLocaleTimeString()}
               </div>
               <div className="font-bold">{code.Päiväkoti}</div>
               <div className="font-mono text-lg">{code.Koodi}</div>
             </div>
           ))}
         </div>
       </div>
     </div>
   </div>
 )
}