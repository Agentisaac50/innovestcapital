import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[calc(100%-2rem)] md:w-auto px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md animate-fade-in flex items-center gap-3 transition-all duration-300 bg-gray-900 border-gray-800 text-sm">
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
      )}
      <div className="text-gray-200 font-medium leading-normal">{message}</div>
    </div>
  );
}
