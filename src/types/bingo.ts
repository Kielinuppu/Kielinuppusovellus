export interface BingoData {
    filename: string;
    height: number;
    width: number;
    size: number;
    url?: string;
    metadata: {
      blurHash: string;
      blurHashWidth: number;
      height: number;
      width: number;
    }
   }
   
   export interface BingoImageInput {
    filename: string;
    height: number;
    width: number;
    size: number;
    url?: string;
    metadata: {
      blurHash: string;
      blurHashWidth: number;
      height: number;
      width: number;
    }
   }
   
   export function parseBingoImage(data: BingoImageInput): BingoData {
    return {
      filename: data.filename,
      height: data.height,
      width: data.width,
      size: data.size,
      url: data.url,  // Lisätty tämä
      metadata: data.metadata
    }
   }