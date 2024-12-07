'use client'
import NextImage from 'next/image'

interface QuickImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  sizes?: string
  loading?: "lazy" | "eager" | undefined
  fill?: boolean  // Lisätään tämä takaisin
}

const QuickImage = ({ src, alt, width, height, className, sizes, fill }: QuickImageProps) => {
  if (fill) {
    return <NextImage 
      src={src}
      alt={alt}
      fill={true}
      quality={75}
      sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
      loading="eager"
      className={className}
    />;
  }

  return <NextImage 
    src={src}
    alt={alt}
    width={width || 400}
    height={height || 400}
    quality={75}
    sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
    loading="eager"
    className={className}
  />;
}

export default QuickImage;