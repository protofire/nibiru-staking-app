import { type ReactElement } from 'react';

// import css from './styles.module.css'
import ImageFallback from '../ImageFallback';

const FALLBACK_ICON = '/token-placeholder.svg';

const TokenIcon = ({
  logoUri,
  tokenSymbol,
  size = 26,
  fallbackSrc,
}: {
  logoUri?: string;
  tokenSymbol?: string;
  size?: number;
  fallbackSrc?: string;
}): ReactElement => {
  return (
    <ImageFallback
      src={logoUri}
      alt={tokenSymbol || ''}
      fallbackSrc={`${fallbackSrc}` || FALLBACK_ICON}
      height={size}
      width={size}
      className="h-8 w-8 rounded-full"
    />
  );
};

export default TokenIcon;
