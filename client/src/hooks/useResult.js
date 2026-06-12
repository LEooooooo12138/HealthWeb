import { useState, useEffect } from 'react';
import { getResultData, pay } from '../services/api-client';
export function useResult(userId) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const load = async () => {
        setLoading(true);
        const r = await getResultData(userId);
        setResult(r);
        setLoading(false);
    };
    useEffect(() => { load(); }, [userId]);
    const doPay = async () => {
        await pay({ userId });
        await load();
    };
    return { result, loading, doPay };
}
