# HealthWeb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete health assessment system with step-by-step quiz, server-side BMI/TDEE calculation, paywall gating, and automated tests.

**Architecture:** Monorepo with three modules — shared types, server (Vercel serverless functions + Supabase), client (React + Vite). Frontend calls `/api/*` endpoints; Vercel routes API paths to serverless functions, everything else to Vite static build.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Vitest, Supabase PostgreSQL, Vercel Serverless Functions

---

## Prerequisites

Before starting, ensure:
- Node.js >= 18 installed
- Supabase project created (get URL, anon key, service_role key)
- Vercel CLI installed (`npm i -g vercel`)

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `shared/package.json`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/index.html`

- [ ] **Step 1: Root workspace package.json**

```json
{
  "name": "healthweb",
  "private": true,
  "workspaces": ["shared", "server", "client"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w client",
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: shared/package.json**

```json
{
  "name": "shared",
  "version": "1.0.0",
  "private": true,
  "main": "index.ts"
}
```

- [ ] **Step 3: server/package.json**

```json
{
  "name": "server",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@supabase/supabase-js": "^2.43.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "tsx": "^4.10.0"
  }
}
```

- [ ] **Step 4: server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": ".",
    "paths": { "shared/*": ["../shared/*"] }
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: client/package.json**

```json
{
  "name": "client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.4.0",
    "vite": "^5.3.0"
  }
}
```

- [ ] **Step 6: client/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "paths": { "shared/*": ["../shared/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 7: client/vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { shared: path.resolve(__dirname, '../shared') },
  },
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
});
```

- [ ] **Step 8: client/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Health Assessment</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`

- [ ] **Step 10: Commit**

```bash
git add package.json shared/ server/ client/
git commit -m "chore: scaffold project workspace"
```

---

### Task 2: Shared types, constants, and validation

**Files:**
- Create: `shared/types.ts`
- Create: `shared/constants.ts`
- Create: `shared/validation.ts`

- [ ] **Step 1: Write shared/types.ts**

```ts
export type Gender = 'male' | 'female';
export type Goal = 'lose_weight' | 'gain_weight' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type StepName = 'gender' | 'goal' | 'body' | 'activity';
export type SubscriptionStatus = 'free' | 'paid';

export interface GenderStep { gender: Gender; }
export interface GoalStep { goal: Goal; }
export interface BodyStep { age: number; heightCm: number; weightKg: number; targetWeightKg: number; }
export interface ActivityStep { activityLevel: ActivityLevel; }

export type StepData = GenderStep | GoalStep | BodyStep | ActivityStep;

export interface SaveStepBody { userId: string; step: StepName; data: StepData; }
export interface SaveStepResponse { ok: true; }

export interface QuizProgress {
  progress: Array<{ step: StepName; data: StepData }>;
  completedSteps: StepName[];
  currentStep: StepName | null;
}

export interface SubmitBody { userId: string; }
export interface SubmitResponse { ok: true; assessmentId: number; }

export interface AssessmentResult {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  targetDate: string;
  weeklyPrediction: Array<{ week: number; weight: number; date: string }>;
}

export interface ResultResponseFree {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  isPaid: false;
  lockedMessage: string;
}

export interface ResultResponsePaid {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  isPaid: true;
  targetDate: string;
  resultJson: AssessmentResult;
}

export type ResultResponse = ResultResponseFree | ResultResponsePaid;

export interface PayBody { userId: string; }
export interface PayResponse { ok: true; subscription: SubscriptionStatus; }
```

- [ ] **Step 2: Write shared/constants.ts**

```ts
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_CALORIE_ADJUSTMENT: Record<string, number> = {
  lose_weight: -500,
  gain_weight: 500,
  maintain: 0,
};

export const BMI_CATEGORIES = [
  { max: 18.5, label: 'underweight' },
  { max: 25, label: 'normal' },
  { max: 30, label: 'overweight' },
  { max: Infinity, label: 'obese' },
];

export const KCAL_PER_KG = 7700;

export const STEPS: Array<'gender' | 'goal' | 'body' | 'activity'> = ['gender', 'goal', 'body', 'activity'];

export const VALIDATION_RULES = {
  heightCm: { min: 50, max: 240 },
  weightKg: { min: 30, max: 300 },
  targetWeightKg: { min: 30, max: 200 },
  age: { min: 10, max: 120 },
};
```

- [ ] **Step 3: Write shared/validation.ts**

```ts
import { VALIDATION_RULES } from './constants';
import type { BodyStep } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateBodyStep(data: BodyStep): void {
  const { heightCm, weightKg, targetWeightKg, age } = data;

  if (typeof heightCm !== 'number')
    throw new ValidationError('heightCm must be a number');
  if (heightCm < VALIDATION_RULES.heightCm.min || heightCm > VALIDATION_RULES.heightCm.max)
    throw new ValidationError(`heightCm must be ${VALIDATION_RULES.heightCm.min}-${VALIDATION_RULES.heightCm.max}`);

  if (typeof weightKg !== 'number')
    throw new ValidationError('weightKg must be a number');
  if (weightKg < VALIDATION_RULES.weightKg.min || weightKg > VALIDATION_RULES.weightKg.max)
    throw new ValidationError(`weightKg must be ${VALIDATION_RULES.weightKg.min}-${VALIDATION_RULES.weightKg.max}`);

  if (typeof targetWeightKg !== 'number')
    throw new ValidationError('targetWeightKg must be a number');
  if (targetWeightKg < VALIDATION_RULES.targetWeightKg.min || targetWeightKg > VALIDATION_RULES.targetWeightKg.max)
    throw new ValidationError(`targetWeightKg must be ${VALIDATION_RULES.targetWeightKg.min}-${VALIDATION_RULES.targetWeightKg.max}`);

  if (typeof age !== 'number')
    throw new ValidationError('age must be a number');
  if (age < VALIDATION_RULES.age.min || age > VALIDATION_RULES.age.max)
    throw new ValidationError(`age must be ${VALIDATION_RULES.age.min}-${VALIDATION_RULES.age.max}`);
}
```

- [ ] **Step 4: Commit**

```bash
git add shared/
git commit -m "feat: add shared types, constants, and validation"
```

---

### Task 3: Database migration

**Files:**
- Create: `supabase/migrations/001_schema.sql`

- [ ] **Step 1: Write migration SQL**

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  subscription  TEXT NOT NULL DEFAULT 'free' CHECK (subscription IN ('free', 'paid'))
);

CREATE TABLE quiz_responses (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step          TEXT NOT NULL CHECK (step IN ('gender', 'goal', 'body', 'activity')),
  data          JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, step)
);

CREATE TABLE assessments (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bmi             NUMERIC(5,1) NOT NULL,
  bmi_category    TEXT NOT NULL,
  daily_calories  INT NOT NULL,
  target_date     DATE NOT NULL,
  result_json     JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE payments (
  id        SERIAL PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES users(id),
  paid_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Run migration against Supabase**

```bash
# Copy the SQL into Supabase Dashboard > SQL Editor and run, or use Supabase CLI
npx supabase db push
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema migration"
```

---

### Task 4: Server infrastructure — Supabase client + repos + middleware

**Files:**
- Create: `server/infra/supabase.ts`
- Create: `server/infra/db/user-repo.ts`
- Create: `server/infra/db/quiz-repo.ts`
- Create: `server/infra/db/subscription-repo.ts`
- Create: `server/infra/middleware.ts`

- [ ] **Step 1: Write supabase client**

```ts
// server/infra/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
```

- [ ] **Step 2: Write user-repo.ts**

```ts
// server/infra/db/user-repo.ts
import { supabase } from '../supabase';

export async function ensureUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId }, { onConflict: 'id' });
  if (error) throw error;
}

export async function getUserSubscription(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('subscription')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data.subscription;
}

export async function setUserPaid(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ subscription: 'paid' })
    .eq('id', userId);
  if (error) throw error;
}
```

- [ ] **Step 3: Write quiz-repo.ts**

```ts
// server/infra/db/quiz-repo.ts
import { supabase } from '../supabase';
import type { StepName, StepData } from 'shared/types';

export async function saveResponse(userId: string, step: StepName, data: StepData): Promise<void> {
  const { error } = await supabase
    .from('quiz_responses')
    .upsert({ user_id: userId, step, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id,step' });
  if (error) throw error;
}

export async function getResponses(userId: string): Promise<Array<{ step: StepName; data: StepData }>> {
  const { data, error } = await supabase
    .from('quiz_responses')
    .select('step, data')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(r => ({ step: r.step as StepName, data: r.data as StepData }));
}

export async function hasAllSteps(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('quiz_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count === 4;
}
```

- [ ] **Step 4: Write subscription-repo.ts**

```ts
// server/infra/db/subscription-repo.ts
import { supabase } from '../supabase';

export async function saveAssessment(userId: string, assessment: {
  bmi: number; bmiCategory: string; dailyCalories: number;
  targetDate: string; resultJson: object;
}): Promise<number> {
  const { data, error } = await supabase
    .from('assessments')
    .upsert({
      user_id: userId,
      bmi: assessment.bmi,
      bmi_category: assessment.bmiCategory,
      daily_calories: assessment.dailyCalories,
      target_date: assessment.targetDate,
      result_json: assessment.resultJson,
    }, { onConflict: 'user_id' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function getAssessment(userId: string): Promise<{
  bmi: number; bmi_category: string; daily_calories: number;
  target_date: string; result_json: object;
} | null> {
  const { data, error } = await supabase
    .from('assessments')
    .select('bmi, bmi_category, daily_calories, target_date, result_json')
    .eq('user_id', userId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    throw error;
  }
  return data;
}

export async function recordPayment(userId: string): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .insert({ user_id: userId });
  if (error) throw error;
}
```

- [ ] **Step 5: Write middleware.ts**

```ts
// server/infra/middleware.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

export function withErrorHandler(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err: any) {
      console.error('API error:', err);
      const status = err.name === 'ValidationError' ? 400 : 500;
      res.status(status).json({
        error: true,
        message: err.message || 'Internal server error',
        code: err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
      });
    }
  };
}
```

- [ ] **Step 6: Commit**

```bash
git add server/infra/
git commit -m "feat: add server infrastructure — supabase client, repos, middleware"
```

---

### Task 5: Algorithm service (TDD)

**Files:**
- Create: `server/services/algorithm.ts`
- Create: `tests/unit/algorithm.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/algorithm.test.ts
import { describe, it, expect } from 'vitest';

// Will fail — function not defined yet
describe('calculateAssessment', () => {
  it('rejects height below minimum', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 30, heightCm: 49, weightKg: 80, targetWeightKg: 70, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('heightCm');
  });

  it('rejects weight below minimum', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 30, heightCm: 175, weightKg: 29, targetWeightKg: 70, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('weightKg');
  });

  it('rejects targetWeightKg above max', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 201, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('targetWeightKg');
  });

  it('rejects age below minimum', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 9, heightCm: 175, weightKg: 80, targetWeightKg: 70, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('age');
  });

  it('computes correct BMI for standard male input', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 70,
      goal: 'lose_weight', activityLevel: 'moderate',
    });
    expect(result.bmi).toBeCloseTo(26.1, 1);
    expect(result.bmiCategory).toBe('overweight');
  });

  it('uses female formula for BMR', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'female', age: 25, heightCm: 165, weightKg: 55, targetWeightKg: 60,
      goal: 'gain_weight', activityLevel: 'light',
    });
    // Female BMR = 10*55 + 6.25*165 - 5*25 - 161 = 550 + 1031.25 - 125 - 161 = 1295.25
    // TDEE for gain = (1295.25 * 1.375) + 500 ≈ 2281
    expect(result.dailyCalories).toBeCloseTo(2281, 0);
    expect(result.bmiCategory).toBe('normal');
  });

  it('maintain does not adjust calories', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 80,
      goal: 'maintain', activityLevel: 'sedentary',
    });
    // BMR = 10*80 + 6.25*175 - 5*30 + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
    // TDEE = 1748.75 * 1.2 ≈ 2099
    expect(result.dailyCalories).toBeCloseTo(2099, 0);
  });

  it('computes target date for weight loss', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 70,
      goal: 'lose_weight', activityLevel: 'moderate',
    });
    // 10 kg * 7700 / 500 = 154 days
    const days = Math.round((new Date(result.targetDate).getTime() - Date.now()) / 86400000);
    expect(days).toBeCloseTo(154, 0);
    expect(result.weeklyPrediction.length).toBeGreaterThan(0);
  });

  it('handles boundary low height and weight', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'female', age: 10, heightCm: 50, weightKg: 30, targetWeightKg: 30,
      goal: 'maintain', activityLevel: 'sedentary',
    });
    expect(result.bmi).toBeGreaterThan(0);
    expect(result.dailyCalories).toBeGreaterThan(0);
  });

  it('handles boundary high values', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 120, heightCm: 240, weightKg: 300, targetWeightKg: 200,
      goal: 'lose_weight', activityLevel: 'very_active',
    });
    expect(result.bmi).toBeGreaterThan(0);
    expect(result.dailyCalories).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `npx vitest run tests/unit/algorithm.test.ts`
Expected: all FAIL (module not found)

- [ ] **Step 3: Write algorithm.ts implementation**

```ts
// server/services/algorithm.ts
import { ACTIVITY_MULTIPLIERS, GOAL_CALORIE_ADJUSTMENT, BMI_CATEGORIES, KCAL_PER_KG, VALIDATION_RULES } from 'shared/constants';
import { ValidationError, validateBodyStep } from 'shared/validation';
import type { AssessmentResult, BodyStep, Gender, Goal, ActivityLevel } from 'shared/types';

export interface UserProfile extends BodyStep {
  gender: Gender;
  goal: Goal;
  activityLevel: ActivityLevel;
}

export function calculateAssessment(profile: UserProfile): AssessmentResult {
  validateBodyStep({ age: profile.age, heightCm: profile.heightCm, weightKg: profile.weightKg, targetWeightKg: profile.targetWeightKg });

  const heightM = profile.heightCm / 100;
  const bmi = Math.round((profile.weightKg / (heightM * heightM)) * 10) / 10;

  let bmiCategory = 'obese';
  for (const cat of BMI_CATEGORIES) {
    if (bmi < cat.max) { bmiCategory = cat.label; break; }
  }

  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  }

  const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.2;
  const goalAdjustment = GOAL_CALORIE_ADJUSTMENT[profile.goal] ?? 0;
  const dailyCalories = Math.round(bmr * activityMultiplier + goalAdjustment);

  const weightDiff = Math.abs(profile.targetWeightKg - profile.weightKg);
  const daysNeeded = Math.round((weightDiff * KCAL_PER_KG) / 500);
  const today = new Date();
  const targetDate = new Date(today.getTime() + daysNeeded * 86400000);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const weeklyPrediction: Array<{ week: number; weight: number; date: string }> = [];
  const direction = profile.targetWeightKg > profile.weightKg ? 1 : -1;
  let currentWeight = profile.weightKg;
  for (let week = 1; week <= Math.ceil(daysNeeded / 7); week++) {
    currentWeight += direction * (500 * 7) / KCAL_PER_KG;
    if (direction > 0 && currentWeight > profile.targetWeightKg) currentWeight = profile.targetWeightKg;
    if (direction < 0 && currentWeight < profile.targetWeightKg) currentWeight = profile.targetWeightKg;
    const d = new Date(today.getTime() + week * 7 * 86400000);
    weeklyPrediction.push({ week, weight: Math.round(currentWeight * 10) / 10, date: d.toISOString().split('T')[0] });
  }

  return { bmi, bmiCategory, dailyCalories, targetDate: targetDateStr, weeklyPrediction };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/algorithm.test.ts`
Expected: all 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add server/services/algorithm.ts tests/unit/algorithm.test.ts
git commit -m "feat: implement health assessment algorithm with unit tests"
```

---

### Task 6: Quiz service (integration tests via Supabase)

**Files:**
- Create: `server/services/quiz-service.ts`
- Create: `tests/integration/quiz-api.test.ts`

- [ ] **Step 1: Write quiz-service.ts**

```ts
// server/services/quiz-service.ts
import { STEPS } from 'shared/constants';
import { ValidationError, validateBodyStep } from 'shared/validation';
import type { StepName, StepData, QuizProgress, BodyStep } from 'shared/types';
import * as userRepo from '../infra/db/user-repo';
import * as quizRepo from '../infra/db/quiz-repo';

export async function saveStep(userId: string, step: StepName, data: StepData): Promise<void> {
  await userRepo.ensureUser(userId);
  if (step === 'body') {
    validateBodyStep(data as BodyStep);
  }
  await quizRepo.saveResponse(userId, step, data);
}

export async function getProgress(userId: string): Promise<QuizProgress> {
  const responses = await quizRepo.getResponses(userId);
  const completedSteps = responses.map(r => r.step) as StepName[];
  const remaining = STEPS.filter(s => !completedSteps.includes(s));
  const currentStep = remaining.length > 0 ? remaining[0] : null;
  return { progress: responses, completedSteps, currentStep };
}

export async function submitQuiz(userId: string): Promise<void> {
  const allDone = await quizRepo.hasAllSteps(userId);
  if (!allDone) throw new ValidationError('All 4 steps must be completed before submitting');
}
```

- [ ] **Step 2: Write integration test — quiz flow**

```ts
// tests/integration/quiz-api.test.ts
import { describe, it, expect, beforeAll } from 'vitest';

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
    // Now submit should work
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
```

- [ ] **Step 3: Commit (tests written first, will be run after API routes exist)**

```bash
git add server/services/quiz-service.ts tests/integration/quiz-api.test.ts
git commit -m "test: add quiz service and integration tests for save & progress"
```

---

### Task 7: Subscription service

**Files:**
- Create: `server/services/subscription-service.ts`
- Create: `tests/integration/result-auth.test.ts`

- [ ] **Step 1: Write subscription-service.ts**

```ts
// server/services/subscription-service.ts
import * as userRepo from '../infra/db/user-repo';
import * as subRepo from '../infra/db/subscription-repo';
import type { ResultResponse, AssessmentResult } from 'shared/types';

export async function processPayment(userId: string): Promise<void> {
  await userRepo.setUserPaid(userId);
  await subRepo.recordPayment(userId);
}

export async function getResult(userId: string): Promise<ResultResponse> {
  const isPaid = (await userRepo.getUserSubscription(userId)) === 'paid';
  const assessment = await subRepo.getAssessment(userId);
  if (!assessment) throw new Error('Assessment not found');

  if (!isPaid) {
    return {
      bmi: assessment.bmi,
      bmiCategory: assessment.bmi_category,
      dailyCalories: assessment.daily_calories,
      isPaid: false,
      lockedMessage: '订阅后解锁完整报告',
    };
  }

  return {
    bmi: assessment.bmi,
    bmiCategory: assessment.bmi_category,
    dailyCalories: assessment.daily_calories,
    isPaid: true,
    targetDate: assessment.target_date,
    resultJson: assessment.result_json as AssessmentResult,
  };
}
```

- [ ] **Step 2: Write integration test — auth & result**

```ts
// tests/integration/result-auth.test.ts
import { describe, it, expect } from 'vitest';

const API = 'http://localhost:3000/api';
const testUserId = `test-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('Auth & result gating', () => {
  it('returns free-tier result (no targetDate, no resultJson)', async () => {
    // Setup: save all 4 steps and submit
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
    // These must NOT be present for free users
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
```

- [ ] **Step 3: Commit**

```bash
git add server/services/subscription-service.ts tests/integration/result-auth.test.ts
git commit -m "test: add subscription service and auth integration tests"
```

---

### Task 8: API routes (save-step, get-progress, submit, get-result, pay)

**Files:**
- Create: `server/api/save-step.ts`
- Create: `server/api/get-progress.ts`
- Create: `server/api/submit.ts`
- Create: `server/api/get-result.ts`
- Create: `server/api/pay.ts`

- [ ] **Step 1: Write POST /api/save-step**

```ts
// server/api/save-step.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as quizService from '../services/quiz-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method not allowed' });
  const { userId, step, data } = req.body;
  if (!userId || !step || !data) {
    return res.status(400).json({ error: true, message: 'userId, step, data are required', code: 'VALIDATION_ERROR' });
  }
  await quizService.saveStep(userId, step, data);
  res.status(200).json({ ok: true });
};

export default withErrorHandler(handler);
```

- [ ] **Step 2: Write GET /api/get-progress**

```ts
// server/api/get-progress.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as quizService from '../services/quiz-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });
  const progress = await quizService.getProgress(userId);
  res.status(200).json(progress);
};

export default withErrorHandler(handler);
```

- [ ] **Step 3: Write POST /api/submit**

```ts
// server/api/submit.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as quizService from '../services/quiz-service';
import * as subRepo from '../infra/db/subscription-repo';
import { calculateAssessment } from '../services/algorithm';
import type { ActivityLevel, BodyStep, Gender, Goal } from 'shared/types';
import * as quizRepo from '../infra/db/quiz-repo';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });

  await quizService.submitQuiz(userId);

  const responses = await quizRepo.getResponses(userId);
  const genderResp = responses.find(r => r.step === 'gender')!.data as { gender: Gender };
  const goalResp = responses.find(r => r.step === 'goal')!.data as { goal: Goal };
  const bodyResp = responses.find(r => r.step === 'body')!.data as BodyStep;
  const activityResp = responses.find(r => r.step === 'activity')!.data as { activityLevel: ActivityLevel };

  const result = calculateAssessment({
    gender: genderResp.gender,
    goal: goalResp.goal,
    ...bodyResp,
    activityLevel: activityResp.activityLevel,
  });

  const assessmentId = await subRepo.saveAssessment(userId, {
    bmi: result.bmi,
    bmiCategory: result.bmiCategory,
    dailyCalories: result.dailyCalories,
    targetDate: result.targetDate,
    resultJson: result,
  });

  res.status(200).json({ ok: true, assessmentId });
};

export default withErrorHandler(handler);
```

- [ ] **Step 4: Write GET /api/get-result**

```ts
// server/api/get-result.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as subService from '../services/subscription-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });
  const result = await subService.getResult(userId);
  res.status(200).json(result);
};

export default withErrorHandler(handler);
```

- [ ] **Step 5: Write POST /api/pay**

```ts
// server/api/pay.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as subService from '../services/subscription-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });
  await subService.processPayment(userId);
  res.status(200).json({ ok: true, subscription: 'paid' });
};

export default withErrorHandler(handler);
```

- [ ] **Step 6: Run integration tests**

Run: `npx vitest run tests/integration/`
Expected: all quiz and auth integration tests PASS

- [ ] **Step 7: Commit**

```bash
git add server/api/ server/services/
git commit -m "feat: implement all API routes with passing integration tests"
```

---

### Task 9: E2E test

**Files:**
- Create: `tests/e2e/full-flow.test.ts`

- [ ] **Step 1: Write E2E test**

```ts
// tests/e2e/full-flow.test.ts
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

    // Free: verify gated
    const freeRes = await fetch(`${API}/get-result?userId=${e2eUserId}`);
    const freeJson = await freeRes.json();
    expect(freeJson.isPaid).toBe(false);
    expect(freeJson.targetDate).toBeUndefined();

    // Pay
    const payRes = await fetch(`${API}/pay`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: e2eUserId }),
    });
    expect(payRes.status).toBe(200);

    // Paid: verify full
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
```

- [ ] **Step 2: Run E2E test**

Run: `npx vitest run tests/e2e/`
Expected: all PASS

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/
git commit -m "test: add end-to-end full funnel test"
```

---

### Task 10: Frontend — API client + hooks + pages

**Files:**
- Create: `client/src/services/api-client.ts`
- Create: `client/src/hooks/useQuiz.ts`
- Create: `client/src/hooks/useResult.ts`
- Create: `client/src/pages/QuizFlow.tsx`
- Create: `client/src/pages/ResultPage.tsx`
- Create: `client/src/pages/PaywallModal.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/main.tsx`

- [ ] **Step 1: Write api-client.ts**

```ts
// client/src/services/api-client.ts
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
```

- [ ] **Step 2: Write useQuiz.ts**

```ts
// client/src/hooks/useQuiz.ts
import { useState, useEffect, useCallback } from 'react';
import { saveStep, getProgress, submitQuiz } from '../services/api-client';
import type { QuizProgress, StepName, StepData, Gender, Goal, ActivityLevel, BodyStep } from 'shared/types';

const STEPS: StepName[] = ['gender', 'goal', 'body', 'activity'];

export function useQuiz(userId: string) {
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    const p = await getProgress(userId);
    setProgress(p);
    if (!p.currentStep) setSubmitted(true);
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const save = async (step: StepName, data: StepData) => {
    await saveStep({ userId, step, data });
    await loadProgress();
  };

  const submit = async () => {
    await submitQuiz({ userId });
    setSubmitted(true);
  };

  return { progress, loading, submitted, save, submit };
}
```

- [ ] **Step 3: Write useResult.ts**

```ts
// client/src/hooks/useResult.ts
import { useState, useEffect } from 'react';
import { getResultData, pay } from '../services/api-client';
import type { ResultResponse } from 'shared/types';

export function useResult(userId: string) {
  const [result, setResult] = useState<ResultResponse | null>(null);
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
```

- [ ] **Step 4: Write QuizFlow.tsx**

```tsx
// client/src/pages/QuizFlow.tsx
import { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import type { StepData, Gender, Goal, ActivityLevel } from 'shared/types';

interface Props { userId: string; onComplete: () => void; }

const STEPS = ['gender', 'goal', 'body', 'activity'] as const;

export function QuizFlow({ userId, onComplete }: Props) {
  const { progress, loading, submitted, save, submit } = useQuiz(userId);
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  if (loading) return <div className="quiz-loading">加载中...</div>;
  if (submitted) return null;

  const currentStep = STEPS[stepIndex];
  const isComplete = progress?.completedSteps.length === 4;

  const handleSaveStep = async () => {
    let data: StepData;
    if (currentStep === 'gender') data = { gender: formData.gender as Gender };
    else if (currentStep === 'goal') data = { goal: formData.goal as Goal };
    else if (currentStep === 'body') data = { age: +formData.age, heightCm: +formData.heightCm, weightKg: +formData.weightKg, targetWeightKg: +formData.targetWeightKg };
    else data = { activityLevel: formData.activityLevel as ActivityLevel };

    await save(currentStep, data);
    if (stepIndex < 3) setStepIndex(stepIndex + 1);
    else await submit();
  };

  return (
    <div className="quiz-container">
      <div className="quiz-progress">步骤 {stepIndex + 1} / 4</div>

      {currentStep === 'gender' && (
        <div className="quiz-step">
          <h2>你的性别是？</h2>
          {(['male', 'female'] as const).map(g => (
            <button key={g} onClick={() => setFormData({ ...formData, gender: g })} className={formData.gender === g ? 'selected' : ''}>
              {g === 'male' ? '男性' : '女性'}
            </button>
          ))}
        </div>
      )}

      {currentStep === 'goal' && (
        <div className="quiz-step">
          <h2>你的目标是什么？</h2>
          {(['lose_weight', 'gain_weight', 'maintain'] as const).map(g => (
            <button key={g} onClick={() => setFormData({ ...formData, goal: g })} className={formData.goal === g ? 'selected' : ''}>
              {g === 'lose_weight' ? '减重' : g === 'gain_weight' ? '增重' : '维持'}
            </button>
          ))}
        </div>
      )}

      {currentStep === 'body' && (
        <div className="quiz-step">
          <h2>你的身体数据</h2>
          <input type="number" placeholder="年龄" onChange={e => setFormData({ ...formData, age: e.target.value })} />
          <input type="number" placeholder="身高 (cm)" onChange={e => setFormData({ ...formData, heightCm: e.target.value })} />
          <input type="number" placeholder="体重 (kg)" onChange={e => setFormData({ ...formData, weightKg: e.target.value })} />
          <input type="number" placeholder="目标体重 (kg)" onChange={e => setFormData({ ...formData, targetWeightKg: e.target.value })} />
        </div>
      )}

      {currentStep === 'activity' && (
        <div className="quiz-step">
          <h2>你的运动频率？</h2>
          {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const).map(a => (
            <button key={a} onClick={() => setFormData({ ...formData, activityLevel: a })} className={formData.activityLevel === a ? 'selected' : ''}>
              {a === 'sedentary' ? '几乎不运动' : a === 'light' ? '轻度运动' : a === 'moderate' ? '中等运动' : a === 'active' ? '活跃' : '非常活跃'}
            </button>
          ))}
        </div>
      )}

      <button onClick={handleSaveStep} className="quiz-next">
        {stepIndex < 3 ? '下一步' : '查看结果'}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Write ResultPage.tsx**

```tsx
// client/src/pages/ResultPage.tsx
import { useResult } from '../hooks/useResult';
import { PaywallModal } from './PaywallModal';

interface Props { userId: string; }

export function ResultPage({ userId }: Props) {
  const { result, loading, doPay } = useResult(userId);

  if (loading) return <div className="result-loading">计算结果中...</div>;
  if (!result) return <div>暂无结果</div>;

  return (
    <div className="result-page">
      <h2>你的健康评估结果</h2>
      <div className="result-card">
        <div className="result-item"><span>BMI</span><strong>{result.bmi}</strong></div>
        <div className="result-item"><span>分类</span><strong>{result.bmiCategory === 'normal' ? '正常' : result.bmiCategory === 'overweight' ? '超重' : result.bmiCategory === 'obese' ? '肥胖' : '偏瘦'}</strong></div>
        <div className="result-item"><span>建议日摄入量</span><strong>{result.dailyCalories} kcal</strong></div>
      </div>

      {!result.isPaid && (
        <PaywallModal onPay={doPay} />
      )}

      {result.isPaid && (
        <div className="result-full">
          <h3>完整报告</h3>
          <p>预计 {result.targetDate} 达到目标体重</p>
          <div className="prediction-chart">
            {result.resultJson.weeklyPrediction.map((w: any) => (
              <div key={w.week} className="chart-row">
                第{w.week}周: {w.weight} kg ({w.date})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Write PaywallModal.tsx**

```tsx
// client/src/pages/PaywallModal.tsx
interface Props { onPay: () => void; }

export function PaywallModal({ onPay }: Props) {
  return (
    <div className="paywall">
      <h3>🔒 解锁完整报告</h3>
      <p>订阅后查看目标体重预测曲线和详细健康分析</p>
      <button onClick={onPay} className="pay-button">立即订阅 · ¥9.9/月</button>
    </div>
  );
}
```

- [ ] **Step 7: Write App.tsx + main.tsx**

```tsx
// client/src/App.tsx
import { useState } from 'react';
import { QuizFlow } from './pages/QuizFlow';
import { ResultPage } from './pages/ResultPage';

function generateUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function App() {
  const [userId] = useState(() => generateUserId());
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="app">
      <h1>Health Assessment</h1>
      {!showResult ? (
        <QuizFlow userId={userId} onComplete={() => setShowResult(true)} />
      ) : (
        <ResultPage userId={userId} />
      )}
    </div>
  );
}
```

```tsx
// client/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
```

- [ ] **Step 8: Verify frontend builds**

Run: `npm run build -w client`
Expected: build succeeds, dist/ created

- [ ] **Step 9: Commit**

```bash
git add client/
git commit -m "feat: implement frontend — quiz flow, result page, paywall"
```

---

### Task 11: Deployment configuration

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Write vercel.json**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api).*)", "destination": "/client/dist/$1" }
  ],
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/dist",
  "functions": {
    "api/*.ts": {
      "runtime": "@vercel/node@3"
    }
  }
}
```

Wait, for Vercel to pick up api/ directory, we need the standard Vercel structure. Let me use a clean setup.

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/$1" }
  ],
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install",
  "functions": {
    "api/*.ts": {
      "runtime": "@vercel/node@3",
      "includeFiles": "shared/**"
    }
  }
}
```

- [ ] **Step 2: Configure environment variables on Vercel**

Go to Vercel Dashboard → Project Settings → Environment Variables:
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = your service_role key

- [ ] **Step 3: Deploy**

```bash
vercel --prod
```

- [ ] **Step 4: Commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel deployment config"
```

---

### Task 12: CI (GitHub Actions)

**Files:**
- Create: `.github/workflows/test.yml`

- [ ] **Step 1: Write test.yml**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run e2e tests
        run: npm run test:e2e
```

- [ ] **Step 2: Add secrets to GitHub repo**

Go to GitHub repo > Settings > Secrets > Actions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Step 3: Commit**

```bash
git add .github/
git commit -m "ci: add GitHub Actions test workflow"
```

---

### Task 13: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write README**

```markdown
# HealthWeb — 健康测评系统

在线健康评估漏斗，支持分步填写、服务端 BMI/TDEE 计算、订阅鉴权和模拟支付。

## 启动

```bash
npm install
npm run dev        # 同时启动前端 (:5173) 和后端 (:3000)
```

## 测试

```bash
npm test                    # 全部测试
npm run test:unit           # 算法单元测试
npm run test:integration    # API 集成测试
npm run test:e2e            # 端到端测试
```

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/save-step | 分步保存 |
| GET  | /api/get-progress?userId=xxx | 进度恢复 |
| POST | /api/submit | 提交 & 计算 |
| GET  | /api/get-result?userId=xxx | 结果页（鉴权差异） |
| POST | /api/pay | 模拟支付 |

### 测试支付流程

```bash
# 支付
curl -X POST https://your-domain.vercel.app/api/pay \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-paid-user"}'

# 对比结果（付费前后）
curl "https://your-domain.vercel.app/api/get-result?userId=test-paid-user"
```

**已支付测试 userId**: `test-paid-user`（需先在数据库执行 `UPDATE users SET subscription='paid' WHERE id='<your-id>'`）

## 测试覆盖

| 层级 | 覆盖场景 |
|---|---|
| 算法单测 | 标准输入、边界极值、非法输入、BMI分类、BMR 男女公式、目标维持热量不变 |
| API 集成 | 分步保存 + 进度恢复、重复覆盖同一步骤、不完整提交返回 400、非法身体数据被拦截 |
| 鉴权集成 | 非会员脱敏（无 targetDate/resultJson）、会员完整返回 |
| E2E | 全漏斗：创建 → 填写 → 提交 → 脱敏 → 支付 → 完整结果 |

未覆盖：前端渲染测试（后续可用 Playwright 补充）。

## 数据库 Schema

```
users 1──* quiz_responses  (分步数据)
users 1──1 assessments     (计算结果)
users 1──* payments        (支付记录)
```

详见 `supabase/migrations/001_schema.sql`。

## 部署

Vercel + Supabase。推送 `main` 分支自动部署。
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: complete README with API docs and test coverage"
```

---

## Post-Plan Checklist

- [ ] All tasks committed
- [ ] `npm test` passes all suites
- [ ] `vercel --prod` deploys successfully
- [ ] Public URL functional — verify full funnel walkthrough
- [ ] README has working cURL for /pay
- [ ] Provide paid test userId in README

