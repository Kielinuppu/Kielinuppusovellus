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

export function parseImageData(jsonString: string): ImageData | null {
  try {
    const fixedString = jsonString.replace(/'/g, '"')
    return JSON.parse(fixedString)
  } catch {
    return null
  }
}