import React, { useRef, useState } from 'react';
import { Upload, X, Star } from 'lucide-react';
import { uploadImageWithProgress } from '../lib/api';
import { useFeedback } from './ToastProvider';
import { ResilientImage } from './ResilientImage';

interface SingleImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export function SingleImageUploader({
  label,
  value,
  onChange,
  helperText = 'JPG, PNG, WEBP, GIF 형식 (최대 5MB)',
}: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useFeedback();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadImageWithProgress(file, setProgress);
      onChange(url);
      showToast('이미지가 업로드되었습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '업로드 실패', 'error');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#1D241E]">{label}</label>
        <span className="text-xs text-neutral-500">{helperText}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#FAF8F4] border border-[#E3DDD3] rounded-lg">
        <div className="w-28 h-28 rounded-lg overflow-hidden border border-[#E3DDD3] bg-white shrink-0">
          <ResilientImage src={value} alt={label} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#2D4F38] text-white rounded-md hover:bg-[#213B2A] disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? `업로드 중 (${progress}%)` : '새 이미지 업로드'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 bg-white border border-[#E3DDD3] rounded-md hover:text-[#DC2626] transition-colors whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                이미지 제거
              </button>
            )}
          </div>
          {uploading && (
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2D4F38] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {value && (
            <p className="text-xs text-neutral-500 truncate font-tabular">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface MultiImageUploaderProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  coverImage?: string;
  onSelectCover?: (url: string) => void;
}

export function MultiImageUploader({
  label,
  images,
  onChange,
  coverImage,
  onSelectCover,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useFeedback();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageWithProgress(files[i], (pct) => {
          const overall = Math.round(((i + pct / 100) / files.length) * 100);
          setProgress(overall);
        });
        uploaded.push(url);
      }
      const next = [...images, ...uploaded];
      onChange(next);
      if (onSelectCover && !coverImage && next.length > 0) {
        onSelectCover(next[0]);
      }
      showToast(`${uploaded.length}개의 이미지가 업로드되었습니다.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '이미지 업로드 실패', 'error');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (url: string) => {
    const next = images.filter((img) => img !== url);
    onChange(next);
    if (onSelectCover && coverImage === url) {
      onSelectCover(next[0] || '');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-sm font-medium text-[#1D241E]">{label}</label>
          <p className="text-xs text-neutral-500 mt-0.5">
            JPG, PNG, WEBP, GIF 형식 (파일당 최대 5MB)
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#2D4F38] text-white rounded-md hover:bg-[#213B2A] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? `업로드 중 (${progress}%)` : '활동 사진 추가'}
          </button>
        </div>
      </div>

      {uploading && (
        <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2D4F38] transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {images.length === 0 ? (
        <div className="p-6 border border-dashed border-[#D5D0C5] rounded-lg text-center text-xs text-neutral-500 bg-[#FAF8F4]">
          등록된 이미지가 없습니다. 위 버튼을 눌러 활동 사진을 추가해 주세요.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, idx) => {
            const isCover = onSelectCover && (coverImage === url || (!coverImage && idx === 0));
            return (
              <div
                key={`${url}-${idx}`}
                className={`group relative rounded-lg overflow-hidden border bg-white ${
                  isCover ? 'border-[#2D4F38] ring-1 ring-[#2D4F38]' : 'border-[#E3DDD3]'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <ResilientImage src={url} alt={`활동 이미지 ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between px-2.5 py-2 bg-white border-t border-[#E3DDD3] text-xs">
                  {onSelectCover ? (
                    <button
                      type="button"
                      onClick={() => onSelectCover(url)}
                      className={`inline-flex items-center gap-1 font-medium whitespace-nowrap ${
                        isCover ? 'text-[#2D4F38]' : 'text-neutral-500 hover:text-[#1D241E]'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-[#2D4F38]' : ''}`} />
                      {isCover ? '대표 이미지' : '대표로 지정'}
                    </button>
                  ) : (
                    <span className="text-neutral-500 font-tabular">#{idx + 1}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="text-neutral-400 hover:text-[#DC2626] p-1 transition-colors"
                    aria-label="이미지 삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
