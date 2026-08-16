import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    // Design configurations based on Toast type
    const styles = {
        success: {
            bg: 'bg-emerald-50 border-emerald-100 text-emerald-800',
            icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
        },
        error: {
            bg: 'bg-rose-50 border-rose-100 text-rose-800',
            icon: <XCircle className="w-5 h-5 text-rose-600" />
        },
        warning: {
            bg: 'bg-amber-50 border-amber-100 text-amber-800',
            icon: <AlertTriangle className="w-5 h-5 text-amber-600" />
        },
        info: {
            bg: 'bg-sky-50 border-sky-100 text-sky-800',
            icon: <Info className="w-5 h-5 text-sky-600" />
        }
    };

    const currentStyle = styles[type] || styles.success;

    return (
        <div className="fixed top-6 right-6 z-[9999] animate-slide-in pointer-events-auto">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl ${currentStyle.bg} min-w-[280px] max-w-sm`}>
                <span className="flex-shrink-0">{currentStyle.icon}</span>
                <p className="text-xs font-bold flex-1 text-left">{message}</p>
                <button 
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100/50 rounded-lg transition-colors text-slate-500 cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
