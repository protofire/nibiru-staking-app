import Image from 'next/image';
import type { ReactElement } from 'react';
import { useState } from 'react';

type ImageAttributes = Omit<React.ComponentProps<typeof Image>, 'src'>;

interface ImageFallbackProps extends ImageAttributes {
  src?: string;
  fallbackSrc: string;
  fallbackComponent?: ReactElement;
  width: number;
  height: number;
}

const ImageFallback = ({
  src,
  fallbackSrc,
  fallbackComponent,
  ...props
}: ImageFallbackProps): React.ReactElement => {
  const [isError, setIsError] = useState<boolean>(false);

  if (isError && fallbackComponent) return fallbackComponent;

  return (
    <Image
      {...props}
      alt={props.alt || ''}
      src={isError || src === undefined ? fallbackSrc : src}
      onError={() => setIsError(true)}
    />
  );
};

export default ImageFallback;
