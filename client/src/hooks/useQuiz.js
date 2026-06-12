import { useState, useEffect, useCallback } from 'react';
import { saveStep, getProgress, submitQuiz } from '../services/api-client';
const STEPS = ['gender', 'goal', 'body', 'activity'];
export function useQuiz(userId) {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const loadProgress = useCallback(async () => {
        setLoading(true);
        const p = await getProgress(userId);
        setProgress(p);
        if (!p.currentStep)
            setSubmitted(true);
        setLoading(false);
    }, [userId]);
    useEffect(() => { loadProgress(); }, [loadProgress]);
    const save = async (step, data) => {
        await saveStep({ userId, step, data });
        await loadProgress();
    };
    const submit = async () => {
        await submitQuiz({ userId });
        setSubmitted(true);
    };
    return { progress, loading, submitted, save, submit };
}
