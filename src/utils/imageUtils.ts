export const getFullImageUrl = (filename: string, folder: 'aiheet' | 'laulut' = 'laulut') => {
  return `https://firebasestorage.googleapis.com/v0/b/kielinuppu-sovellus.appspot.com/o/images%2F${folder}%2F${filename}?alt=media`
}