import { ImageData, parseImageData } from './image'

export interface Laulu {
  id: string;
  Name: string;
  'Laulun kuvake': string;
  Aiheet: string;
  parsedImage?: ImageData;
}

export { parseImageData }