'use client'
import NextImage from 'next/image'

interface QuickImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean  // Lisätty tämä
}

const QuickImage = ({
  src,
  alt,
  width = 1000,
  height = 1000,
  className = '',
  fill = false,
  sizes = '100vw',
  priority = false  // Oletuksena false
}: QuickImageProps) => {
  return (
    <NextImage
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={90}
      className={`w-auto h-auto ${className}`}
    />
  )
}

export default QuickImage