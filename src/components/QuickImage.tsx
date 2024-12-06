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
}

const QuickImage = ({ width, height, fill, priority, sizes, ...props }: QuickImageProps) => {
  const imgProps = {
    ...props,
    priority: priority || false,
    sizes: sizes || '100vw',
  };

  if (fill) {
    return <NextImage {...imgProps} fill={true} className={props.className} />;
  }

  return <NextImage 
    {...imgProps} 
    width={width || 0}  // Varmistetaan että width on määritelty
    height={height || 0}  // Varmistetaan että height on määritelty
    className={props.className}
  />;
}

export default QuickImage;
