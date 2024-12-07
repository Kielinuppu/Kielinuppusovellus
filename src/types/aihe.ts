export interface ImageData {
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
  metadata: {
    width: number;
    height: number;
    blurHash: string;
    blurHashWidth: number;
  }
}

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

export function parseImageData(jsonString: string): ImageData | null {
  try {
    const fixedString = jsonString.replace(/'/g, '"')
    return JSON.parse(fixedString)
  } catch {
    return null
  }
}