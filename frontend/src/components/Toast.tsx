"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Toast {
    id: string;
    type: "success" | "error" | "info";
    message: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (type: Toast["type"], message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: Toast["type"], message: string, duration = 5000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onDismiss]);

    const icons = {
        success: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />,
        error: <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />,
        info: <Info className="h-4 w-4 text-cyan-400 shrink-0" />,
    };

    const borders = {
        success: "border-emerald-500/20 bg-emerald-500/10",
        error: "border-red-500/20 bg-red-500/10",
        info: "border-cyan-500/20 bg-cyan-500/10",
    };

    return (
        <div className={`flex items-start gap-3 rounded-xl border ${borders[toast.type]} p-4 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-5`}>
            {icons[toast.type]}
            <p className="text-sm text-zinc-200 flex-1">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-zinc-500 hover:text-white transition-colors shrink-0"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
