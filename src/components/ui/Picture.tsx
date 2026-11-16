import Image, { type ImageProps } from "next/image";
import { getMedia, type ImageRef } from "@/lib/media";

type Props = Omit<ImageProps, "src" | "width" | "height" | "placeholder" | "blurDataURL" | "alt"> & {
  media: ImageRef;
  alt: string;
};

/** next/image bound to the media manifest (dimensions + blur placeholder) or an uploaded image URL. */
export default function Picture({ media, alt, fill, sizes, quality = 85, ...rest }: Props) {
  const m = getMedia(media);
  if (!m.src) return null;
  const dims = fill ? {} : { width: m.width, height: m.height };
  return (
    <Image
      src={m.src}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "100vw"}
      // Photography of fine woodwork: grain and joinery detail need more than the default 75.
      quality={quality}
      placeholder={m.blur ? "blur" : "empty"}
      blurDataURL={m.blur || undefined}
      {...dims}
      {...rest}
    />
  );
}
