import { describe, it, expect } from 'vitest';

const API = 'http://localhost:3000/api';
const e2eUserId = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('Full end-to-end flow', () => {
  it('completes entire funnel: fill → submit → gated → pay → full', async () => {
    const steps = [
      ['gender', { gender: 'female' }],
      ['goal', { goal: 'gain_weight' }],
      ['body', { age: 25, heightCm: 165, weightKg: 55, targetWeightKg: 60 }],
      ['activity', { activityLevel: 'light' }],
    ] as const;

    for (const [step, data] of steps) {
      const res = await fetch(`${API}/save-step`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: e2eUserId, step, data }),
      });
      expect(res.status).toBe(200);
    }

    const submitRes = await fetch(`${API}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: e2eUserId }),
    });
    expect(submitRes.status).toBe(200);

    const freeRes = await fetch(`${API}/get-result?userId=${e2eUserId}`);
    const freeJson = await freeRes.json();
    expect(freeJson.isPaid).toBe(false);
    expect(freeJson.targetDate).toBeUndefined();

    const payRes = await fetch(`${API}/pay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: e2eUserId }),
    });
    expect(payRes.status).toBe(200);

    const paidRes = await fetch(`${API}/get-result?userId=${e2eUserId}`);
    const paidJson = await paidRes.json();
    expect(paidJson.isPaid).toBe(true);
    expect(paidJson.targetDate).toBeTruthy();
    expect(paidJson.resultJson.weeklyPrediction).toBeDefined();

    // Pay again: idempotent
    const payAgain = await fetch(`${API}/pay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: e2eUserId }),
    });
    expect(payAgain.status).toBe(200);
  });
});
