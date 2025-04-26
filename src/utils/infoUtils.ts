// src/utils/infoUtils.ts
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { InfoData } from '@/types/info'
import { useCache } from '@/app/hooks/useCache'

// Hae info kategorian ja sivun perusteella
export const fetchInfoByCategory = async (
  category: string,
  page: string
): Promise<InfoData | null> => {
  try {
    const infoRef = collection(db, 'infot')
    const infoQuery = query(
      infoRef, 
      where('category', '==', category),
      where('page', '==', page)
    )
    
    const infoSnapshot = await getDocs(infoQuery)
    
    if (infoSnapshot.empty) {
      console.log(`Ei löydy infoa kategorialle: ${category}, sivu: ${page}`)
      return null
    }
    
    const infoDoc = infoSnapshot.docs[0]
    const data = infoDoc.data()
    
    // Varmista että imageFiles on array, vaikka tietokannassa olisi vain yksi kuva
    let imageFiles = data.imageFiles || []
    
    // Jos imageFiles on string (eli vain yksi kuva), muunna se arrayksi
    if (typeof imageFiles === 'string') {
      imageFiles = [imageFiles]
    }
    
    return {
      id: infoDoc.id,
      ...data,
      imageFiles
    } as InfoData
  } catch (error) {
    console.error('Virhe info-tietojen haussa:', error)
    return null
  }
}

// Hae info ID:n perusteella
export const fetchInfoById = async (id: string): Promise<InfoData | null> => {
  try {
    const infoDoc = await getDoc(doc(db, 'infot', id))
    
    if (!infoDoc.exists()) {
      return null
    }
    
    const data = infoDoc.data()
    
    // Varmista että imageFiles on array, vaikka tietokannassa olisi vain yksi kuva
    let imageFiles = data.imageFiles || []
    
    // Jos imageFiles on string (eli vain yksi kuva), muunna se arrayksi
    if (typeof imageFiles === 'string') {
      imageFiles = [imageFiles]
    }
    
    return {
      id: infoDoc.id,
      ...data,
      imageFiles
    } as InfoData
  } catch (error) {
    console.error('Virhe info-tietojen haussa ID:llä:', error)
    return null
  }
}

// Hook infotietojen hakemiseen cachella
export const useInfoData = (category: string, page: string) => {
  return useCache<InfoData | null>(
    `info-${category}-${page}`,
    async () => {
      if (!category || !page) return null
      return fetchInfoByCategory(category, page)
    }
  )
}