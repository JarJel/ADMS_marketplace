import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Hapus", cancelText = "Batal", type = "danger" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        type === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                    }`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="pt-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm ${
                            type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
