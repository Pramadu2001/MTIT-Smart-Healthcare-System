// components/ui/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';
    
    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
                isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
                {isSuccess ? (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>
                    {message}
                </span>
                <button onClick={onClose} className="ml-2 p-0.5 rounded-full hover:bg-black/5 transition-colors">
                    <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
            </div>
        </div>
    );
}