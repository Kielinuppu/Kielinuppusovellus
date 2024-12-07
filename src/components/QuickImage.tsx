'use client'
import NextImage from 'next/image'

interface QuickImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  loading?: "lazy" | "eager" | undefined
}

const QuickImage = ({ width, height, fill, priority, sizes, ...props }: QuickImageProps) => {
  // Poistetaan erillinen imgProps objekti ja käytetään props suoraan
  if (fill) {
    return <NextImage 
      {...props}
      fill={true} 
      priority={priority || false}
      sizes={sizes || '100vw'}
      loading="eager"
    />;
  }

  return <NextImage 
    {...props}
    width={width}
    height={height}
    priority={priority || false}
    sizes={sizes || '100vw'}
    loading="eager"
  />;
}

export default QuickImage;