export const getFullImageUrl = (filename: string, folder: 'aiheet' | 'laulut' = 'laulut') => {
    // Jos filename on jo täysi URL, käytä sitä suoraan
    if (filename.startsWith('https://')) {
      return filename;
    }
    // Muuten muodosta URL Firebasen polusta
    return `https://firebasestorage.googleapis.com/v0/b/kielinuppu-sovellus.appspot.com/o/images%2F${folder}%2F${filename}?alt=media`
  }