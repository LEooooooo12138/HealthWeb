const BASE = '/api';
async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Request failed');
    }
    return res.json();
}
export async function saveStep(body) {
    return post('/save-step', body);
}
export async function getProgress(userId) {
    const res = await fetch(`${BASE}/get-progress?userId=${encodeURIComponent(userId)}`);
    if (!res.ok)
        throw new Error('Failed to get progress');
    return res.json();
}
export async function submitQuiz(body) {
    return post('/submit', body);
}
export async function getResultData(userId) {
    const res = await fetch(`${BASE}/get-result?userId=${encodeURIComponent(userId)}`);
    if (!res.ok)
        throw new Error('Failed to get result');
    return res.json();
}
export async function pay(body) {
    return post('/pay', body);
}
