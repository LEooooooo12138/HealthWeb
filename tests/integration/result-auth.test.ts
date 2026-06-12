import { describe, it, expect } from 'vitest';

const API = 'http://localhost:3000/api';
const testUserId = `test-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('Auth & result gating', () => {
  it('returns free-tier result (no targetDate, no resultJson)', async () => {
    for (const [step, data] of [
      ['gender', { gender: 'male' }],
      ['goal', { goal: 'lose_weight' }],
      ['body', { age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 70 }],
      ['activity', { activityLevel: 'moderate' }],
    ] as const) {
      await fetch(`${API}/save-step`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: testUserId, step, data }),
      });
    }
    await fetch(`${API}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId }),
    });

    const res = await fetch(`${API}/get-result?userId=${testUserId}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isPaid).toBe(false);
    expect(json.bmi).toBeGreaterThan(0);
    expect(json.lockedMessage).toBeTruthy();
    expect(json.targetDate).toBeUndefined();
    expect(json.resultJson).toBeUndefined();
  });

  it('returns full result after payment', async () => {
    await fetch(`${API}/pay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId }),
    });

    const res = await fetch(`${API}/get-result?userId=${testUserId}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isPaid).toBe(true);
    expect(json.targetDate).toBeTruthy();
    expect(json.resultJson).toBeTruthy();
    expect(json.resultJson.weeklyPrediction).toBeDefined();
  });
});
