import type {
  SaveStepBody, SaveStepResponse, QuizProgress,
  SubmitBody, SubmitResponse, ResultResponse, PayBody, PayResponse,
} from 'shared/types';

const BASE = '/api';

async function post<T>(path: string, body: object): Promise<T> {
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

export async function saveStep(body: SaveStepBody): Promise<SaveStepResponse> {
  return post('/save-step', body);
}

export async function getProgress(userId: string): Promise<QuizProgress> {
  const res = await fetch(`${BASE}/get-progress?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to get progress');
  return res.json();
}

export async function submitQuiz(body: SubmitBody): Promise<SubmitResponse> {
  return post('/submit', body);
}

export async function getResultData(userId: string): Promise<ResultResponse> {
  const res = await fetch(`${BASE}/get-result?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to get result');
  return res.json();
}

export async function pay(body: PayBody): Promise<PayResponse> {
  return post('/pay', body);
}
