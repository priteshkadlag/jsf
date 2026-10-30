import Image, { type ImageProps } from "next/image";
import { getMedia, type MediaKey } from "@/lib/media";

type Props = Omit<ImageProps, "src" | "width" | "height" | "placeholder" | "blurDataURL" | "alt"> & {
  media: MediaKey;
  alt: string;
};

/** next/image bound to the generated media manifest (dimensions + blur placeholder). */
export default function Picture({ media, alt, fill, sizes, ...rest }: Props) {
  const m = getMedia(media);
  const dims = fill ? {} : { width: m.width, height: m.height };
  return (
    <Image
      src={m.src}
      alt={alt}
      fill={fill}
      sizes={sizes ?? "100vw"}
      placeholder={m.blur ? "blur" : "empty"}
      blurDataURL={m.blur || undefined}
      {...dims}
      {...rest}
    />
  );
}
