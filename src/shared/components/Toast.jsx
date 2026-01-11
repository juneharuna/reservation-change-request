import React, { useEffect } from 'react';
import { useRequestStore } from '../../core/store/useRequestStore';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Toast() {
    const { toast, hideToast } = useRequestStore();

    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => {
                hideToast();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.visible, hideToast]);

    if (!toast.visible) return null;

    const isError = toast.type === 'error';

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={cn(
                "flex items-center gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all",
                isError
                    ? "bg-rose-50/90 border-rose-100 text-rose-800 shadow-rose-200/20"
                    : "bg-emerald-50/90 border-emerald-100 text-emerald-800 shadow-emerald-200/20"
            )}>
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isError ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                )}>
                    {isError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black whitespace-pre-wrap leading-snug">
                        {toast.message}
                    </p>
                </div>

                <button
                    onClick={hideToast}
                    className="p-2 hover:bg-black/5 rounded-lg transition-colors shrink-0"
                >
                    <X size={18} className="opacity-40" />
                </button>
            </div>
        </div>
    );
}
