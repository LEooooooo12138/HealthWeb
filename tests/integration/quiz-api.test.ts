import { describe, it, expect } from 'vitest';

const API = 'http://localhost:3000/api';
const testUserId = `test-quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('Quiz save & progress', () => {
  it('saves gender step', async () => {
    const res = await fetch(`${API}/save-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, step: 'gender', data: { gender: 'male' } }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('saves goal step', async () => {
    const res = await fetch(`${API}/save-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, step: 'goal', data: { goal: 'lose_weight' } }),
    });
    expect(res.status).toBe(200);
  });

  it('recovers progress after partial fill', async () => {
    const res = await fetch(`${API}/get-progress?userId=${testUserId}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.completedSteps).toContain('gender');
    expect(json.completedSteps).toContain('goal');
    expect(json.currentStep).toBe('body');
  });

  it('overwrites same step', async () => {
    await fetch(`${API}/save-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, step: 'gender', data: { gender: 'female' } }),
    });
    const res = await fetch(`${API}/get-progress?userId=${testUserId}`);
    const json = await res.json();
    const genderData = json.progress.find((p: any) => p.step === 'gender');
    expect(genderData.data.gender).toBe('female');
  });

  it('rejects submit without all 4 steps', async () => {
    const res = await fetch(`${API}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe(true);
  });

  it('rejects invalid body data', async () => {
    const res = await fetch(`${API}/save-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, step: 'body', data: { age: 30, heightCm: 49, weightKg: 80, targetWeightKg: 70 } }),
    });
    expect(res.status).toBe(400);
  });

  it('completes all steps and submits successfully', async () => {
    await fetch(`${API}/save-step`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, step: 'body', data: { age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 70 } }),
    });
    await fetch(`${API}/save-step`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, step: 'activity', data: { activityLevel: 'moderate' } }),
    });
    const res = await fetch(`${API}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.assessmentId).toBeGreaterThan(0);
  });
});
