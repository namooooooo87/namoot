import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { resolveAssetUrl } from '../lib/assetUrl';

interface ResilientImageProps {
  src?: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  onClick,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveAssetUrl(src);

  if (!resolvedSrc || hasError) {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center bg-[#F2EFE9] text-neutral-500 border border-[#E3DDD3] px-4 text-center ${containerClassName} ${className}`}
      >
        <ImageIcon className="w-7 h-7 text-neutral-400 mb-2 shrink-0" />
        <span className="text-xs font-medium text-neutral-600 line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      onClick={onClick}
      className={className}
    />
  );
}
