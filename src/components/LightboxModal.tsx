import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ResilientImage } from './ResilientImage';

interface LightboxModalProps {
  images: string[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  title?: string;
}

export function LightboxModal({
  images,
  activeIndex,
  onClose,
  onChangeIndex,
  title,
}: LightboxModalProps) {
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        onChangeIndex((activeIndex - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        onChangeIndex((activeIndex + 1) % images.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, images.length, onChangeIndex, onClose]);

  if (activeIndex === null || !images[activeIndex]) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || '활동 사진 확대 보기'}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="닫기"
      >
        <X className="w-5 h-5" />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChangeIndex((activeIndex - 1 + images.length) % images.length);
          }}
          className="absolute left-4 sm:left-6 p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="이전 사진"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <div
        className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-h-[76vh] flex items-center justify-center overflow-hidden rounded-lg">
          <ResilientImage
            src={images[activeIndex]}
            alt={title ? `${title} - 사진 ${activeIndex + 1}` : `사진 ${activeIndex + 1}`}
            className="max-h-[76vh] w-auto object-contain rounded-lg"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-white/80 font-tabular">
          {title && <span>{title}</span>}
          {title && <span aria-hidden="true">·</span>}
          <span>
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChangeIndex((activeIndex + 1) % images.length);
          }}
          className="absolute right-4 sm:right-6 p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="다음 사진"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
