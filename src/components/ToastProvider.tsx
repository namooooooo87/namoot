import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface FeedbackContextValue {
  showToast: (message: string, type?: 'success' | 'error') => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <FeedbackContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md bg-white text-sm transition-all ${
              toast.type === 'error'
                ? 'border-[#DC2626]/30 text-[#991B1B]'
                : 'border-[#2D4F38]/20 text-[#1D241E]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#2D4F38] shrink-0 mt-0.5" />
            )}
            <span className="flex-1 leading-relaxed">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-neutral-400 hover:text-neutral-700 p-0.5 shrink-0"
              aria-label="알림 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Accessible Confirm Dialog */}
      {confirmState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="bg-white border border-[#E3DDD3] rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 id="confirm-dialog-title" className="text-lg font-semibold text-[#1D241E]">
              {confirmState.options.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              {confirmState.options.description}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
              >
                {confirmState.options.cancelLabel || '취소'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap ${
                  confirmState.options.destructive
                    ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                    : 'bg-[#2D4F38] hover:bg-[#213B2A]'
                }`}
              >
                {confirmState.options.confirmLabel || '확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return ctx;
}
