import React, { useState } from 'react';

export const GW = "http://localhost:8000";

export async function api(method, path, body) {
    const response = await fetch(`${GW}/${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
}

export function useToast() {
    const [toast, setToast] = useState(null);
    
    const show = (msg, type = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2800);
    };
    
    return { toast, show };
}