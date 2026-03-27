import React, { useState, useCallback } from 'react';
import { GW } from '../utils/api';

export function useApi(endpoint) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${GW}/${endpoint}`);
            const data = await response.json();
            
            // Handle different service response formats
            let records = [];
            switch (endpoint) {
                case "patients":
                    records = data.patients || [];
                    break;
                case "doctors":
                    records = data.doctors || [];
                    break;
                case "appointments":
                    records = data.appointments || [];
                    break;
                case "prescriptions":
                    records = data.prescriptions || [];
                    break;
                case "lab-results":
                    records = data.results || [];
                    break;
                case "payments":
                    records = data.payments || [];
                    break;
                default:
                    records = data;
            }
            
            setData(Array.isArray(records) ? records : []);
        } catch (err) {
            console.error(`Error loading ${endpoint}:`, err);
            setError(`Cannot connect to ${endpoint} service`);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);
    
    return { data, loading, error, load, setData };
}