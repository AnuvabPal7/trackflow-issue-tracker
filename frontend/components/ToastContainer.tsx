import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs transition-all duration-200 animate-in slide-in-from-bottom-3 ${
              isError
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {isError && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {!isError && !isSuccess && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-md hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
