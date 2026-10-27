import NextImage from 'next/image'

import type { Image } from '@/lib/content/schemas'

type ContentImageProps = {
  image: Image | undefined
  /** responsive `sizes` hint matching the CSS layout */
  sizes: string
  className?: string
  /** above-the-fold LCP image: preload + high fetch priority, never lazy */
  priority?: boolean
  /** render at a fixed display size (logos) instead of responsive widths */
  width?: number
  height?: number
  alt?: string
}

/**
 * next/image without `fill`: it renders a single <img> with no wrapper, and
 * the original CSS sets its size and object-fit, so layout is unchanged.
 * Width/height attributes reserve space to prevent CLS.
 */
export function ContentImage({
  image,
  sizes,
  className,
  priority,
  width,
  height,
  alt,
}: ContentImageProps) {
  if (!image) return null
  return (
    <NextImage
      src={image.src}
      alt={alt ?? image.alt}
      width={width ?? image.width}
      height={height ?? image.height}
      sizes={sizes}
      className={className}
      quality={80}
      decoding="async"
      {...(priority
        ? { preload: true, fetchPriority: 'high' as const, loading: 'eager' as const }
        : { loading: 'lazy' as const })}
    />
  )
}
