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
      if (!jsonString.trim()) {
        return null;
      }
      
      const fixedString = jsonString.replace(/'/g, '"')
      const data = JSON.parse(fixedString)
      
      return {
        url: data.filename,
        size: data.size,
        width: data.width,
        height: data.height,
        filename: data.filename,
        metadata: {
          width: data.metadata.width,
          height: data.metadata.height,
          blurHash: data.metadata.blurHash,
          blurHashWidth: data.metadata.blurHashWidth
        }
      }
    } catch (error) {
      console.error('Error parsing image data:', error, jsonString)
      return null
    }
  }