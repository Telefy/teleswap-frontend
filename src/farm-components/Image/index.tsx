/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { cloudinaryLoader } from 'functions'
import { FC } from 'react'

import { shimmer } from './shimmer'
declare const VALID_LAYOUT_VALUES: readonly ['fill', 'fixed', 'intrinsic', 'responsive', 'raw', undefined]
declare type LayoutValue = typeof VALID_LAYOUT_VALUES[number]
declare type ImageLoaderProps = {
  src: string
  width: number
  quality?: number
}
declare type ImageLoader = (resolverProps: ImageLoaderProps) => string
declare type ImageProps = Omit<
  JSX.IntrinsicElements['img'],
  'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'
> & {
  src: string
  width?: number | string
  height?: number | string
  layout?: LayoutValue
  loader?: ImageLoader
  quality?: number | string
  priority?: boolean
  loading?: any
  lazyRoot?: React.RefObject<HTMLElement> | null
  lazyBoundary?: string
  placeholder?: any
  blurDataURL?: string
  unoptimized?: boolean
  objectFit?: any
  objectPosition?: any
  onLoadingComplete?: any
}

// @ts-ignore TYPE NEEDS FIXING
const toBase64 = (str) => (typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str))

const Image: FC<ImageProps> = ({ src, width, height, layout, ...rest }) => {
  const useBlur = parseInt(String(height), 10) >= 40 && parseInt(String(width), 10) >= 40

  /* Only remote images get routed to Cloudinary */
  const loader = typeof src === 'string' && src.includes('http') ? cloudinaryLoader : undefined

  return (
    <div style={{ width, height }} className="overflow-hidden rounded">
      {useBlur ? (
        <img
          loader={loader}
          src={src}
          width={width}
          height={height}
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`}
          {...rest}
        />
      ) : (
        <img loader={loader} src={src} width={width} height={height} placeholder="empty" {...rest} />
      )}
    </div>
  )
}

export default Image
