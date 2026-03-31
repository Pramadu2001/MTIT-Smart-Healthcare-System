// components/ui/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading patients...</span>
        </div>
    );
}