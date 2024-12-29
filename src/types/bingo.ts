export interface BingoData {
  filename: string;
  height?: number;  // Optional
  width?: number;   // Optional
  size?: number;    // Optional
  url?: string;
  metadata?: {      // Optional
    blurHash?: string;
    blurHashWidth?: number;
    height?: number;
    width?: number;
  }
}
 
export interface BingoImageInput {
  filename: string;
  height?: number;  // Optional
  width?: number;   // Optional
  size?: number;    // Optional
  url?: string;
  metadata?: {      // Optional
    blurHash?: string;
    blurHashWidth?: number;
    height?: number;
    width?: number;
  }
}
 
export function parseBingoImage(data: BingoImageInput | null | undefined): BingoData | null {
  if (!data || !data.filename) return null;
  
  return {
      filename: data.filename,
      height: data.height,
      width: data.width,
      size: data.size,
      url: data.url,
      metadata: data.metadata
  }
}