import { ImageData, parseImageData } from './image'

export interface Aihe {
  id: string;
  ID: number;
  Name: string;
  aiheenkuva: string;
  'tutustu kuvat': string;
  Created: string;
  Updated: string;
  parsedAiheKuva?: ImageData;
  parsedTutustuKuva?: ImageData;
}

export { parseImageData }