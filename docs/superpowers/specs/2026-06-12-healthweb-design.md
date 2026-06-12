# HealthWeb 健康测评系统 — 架构设计

> 2026-06-12 | 基于 [笔试1 需求](/Users/yuanleyao/Documents/笔试1.txt)

## 技术选型

| 模块 | 选型 | 理由 |
|---|---|---|
| 前端 | React + Vite + TypeScript | 用户指定 |
| 后端 | Node.js + TypeScript（Vercel Serverless Functions） | 笔试要求 Node.js + TS；匹配前端 Vite 生态 |
| 数据库 | Supabase PostgreSQL（免费 500MB） | 自带托管，与 Vercel 配合顺滑 |
| 部署 | Vercel 单仓（Monorepo） | 推代码自动上线，前后端同域零 CORS |
| 测试 | Vitest + GitHub Actions CI | 轻快，与 Vite 生态一致 |

## 项目结构

```
HealthWeb/
├── vercel.json                              # Vercel 路由配置
├── package.json                             # workspace root
│
├── shared/                                  # 前后端共享（接口契约）
│   ├── types.ts                             # UserProfile, QuizStep, AssessmentResult, SubscriptionStatus
│   ├── constants.ts                         # BMI 区间、热量系数、步骤枚举
│   └── validation.ts                        # 输入校验规则（前端 & 后端复用）
│
├── server/                                   # 后端（独立模块，可单测）
│   ├── tsconfig.json
│   ├── package.json
│   ├── api/                                  # Vercel serverless 入口（薄层，只做路由 & 响应）
│   │   ├── save-step.ts                      # POST /api/save-step
│   │   ├── get-progress.ts                   # GET  /api/get-progress?userId=xxx
│   │   ├── submit.ts                         # POST /api/submit
│   │   ├── get-result.ts                     # GET  /api/get-result?userId=xxx
│   │   └── pay.ts                            # POST /api/pay
│   ├── services/                             # 业务逻辑（纯函数，不依赖 HTTP）
│   │   ├── quiz-service.ts                   # 分步保存 & 进度恢复
│   │   ├── algorithm.ts                      # 健康评估算法
│   │   └── subscription-service.ts           # 鉴权差异 & 支付回调
│   └── infra/                                # 基础设施
│       ├── supabase.ts                       # Supabase client
│       ├── db/                               # 数据库操作层
│       │   ├── user-repo.ts
│       │   ├── quiz-repo.ts
│       │   └── subscription-repo.ts
│       └── middleware.ts                     # 错误处理、日志
│
├── client/                                   # 前端（独立模块）
│   ├── tsconfig.json
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── services/
│   │   │   └── api-client.ts                 # fetch 封装
│   │   ├── hooks/
│   │   │   ├── useQuiz.ts
│   │   │   └── useResult.ts
│   │   ├── pages/
│   │   │   ├── QuizFlow.tsx
│   │   │   ├── ResultPage.tsx
│   │   │   └── PaywallModal.tsx
│   │   ├── components/
│   │   └── App.tsx
│   └── index.html
│
├── tests/
│   ├── unit/
│   │   └── algorithm.test.ts
│   ├── integration/
│   │   ├── quiz-api.test.ts
│   │   └── result-auth.test.ts
│   └── e2e/
│       └── full-flow.test.ts
│
└── README.md
```

### 分层职责与依赖方向

| 层级 | 职责 | 依赖 |
|---|---|---|
| `shared/` | 类型、常量、校验规则 | 无 |
| `server/services/` | 纯业务逻辑 | shared + infra/db |
| `server/api/` | HTTP 薄层 | services |
| `client/services/` | HTTP 调用层 | shared |
| `client/hooks/` | 前端状态 | services |
| `client/pages/` | UI 渲染 | hooks |

## 数据库 Schema（Supabase PostgreSQL）

```sql
-- users
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  subscription    TEXT NOT NULL DEFAULT 'free'
);

-- quiz_responses: 分步测评数据（每步一条，UPSERT）
CREATE TABLE quiz_responses (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step            TEXT NOT NULL,
  data            JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, step)
);

-- assessments: 服务端计算结果
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

-- payments: 模拟支付记录（审计）
CREATE TABLE payments (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id),
  paid_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 关系图

```
users 1──* quiz_responses
users 1──1 assessments
users 1──* payments
```

## API 设计

### POST /api/save-step — 分步保存

```
Body: { userId: string, step: string, data: object }
Response: { ok: true }
```
- userId 不存在时自动创建用户
- step 覆盖写入（UPSERT）

### GET /api/get-progress?userId=xxx — 进度恢复

```
Response: {
  progress: [{ step, data }, ...],
  completedSteps: ["gender", "goal"],
  currentStep: "body"
}
```

### POST /api/submit — 提交计算

```
Body: { userId: string }
Response: { ok: true, assessmentId: number }
```
- 校验四步齐全，否则 400
- 调用 algorithm.ts 计算后写入 assessments

### GET /api/get-result?userId=xxx — 结果页（鉴权差异化）

非会员：仅返回 bmi, bmiCategory, dailyCalories, isPaid=false, lockedMessage
会员：额外返回 targetDate, resultJson, isPaid=true
- 脱敏由后端决定，非会员绝对拿不到敏感字段

### POST /api/pay — 模拟支付

```
Body: { userId: string }
Response: { ok: true, subscription: "paid" }
```
- 更新 users.subscription = 'paid' + 插入 payments 记录

### 错误格式

```json
{ "error": true, "message": "...", "code": "VALIDATION_ERROR" }
```

## 核心算法（`server/services/algorithm.ts`）

纯函数，输入 UserProfile，输出 AssessmentResult。

### 输入

```ts
interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  heightCm: number;        // 50–240
  weightKg: number;        // 30–300
  targetWeightKg: number;  // 30–200
  goal: 'lose_weight' | 'gain_weight' | 'maintain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}
```

### 计算步骤

1. **BMI** = weightKg / (heightM²)，分类 <18.5 / 18.5-24.9 / 25-29.9 / ≥30
2. **BMR**（Mifflin-St Jeor）：男 = 10w + 6.25h - 5a + 5，女 = 10w + 6.25h - 5a - 161
3. **TDEE** = BMR × 活动系数（1.2/1.375/1.55/1.725/1.9），减重 -500、增重 +500、维持不变
4. **预测日期** = today + (|targetWeightKg - weightKg| × 7700 / 500) 天

### 边界校验

| 字段 | 范围 |
|---|---|
| heightCm | 50–240 |
| weightKg | 30–300 |
| targetWeightKg | 30–200 |
| age | 10–120 |
| gender | male / female |

校验规则同时写在 `shared/validation.ts`，前后端共用。

## 测试策略

| 类型 | 文件 | 覆盖 |
|---|---|---|
| 算法单测 | `tests/unit/algorithm.test.ts` | 标准输入、边界高低、非法值、缺失字段、维持体重等 |
| API 集成 | `tests/integration/quiz-api.test.ts` | 分步保存、进度恢复、重复覆盖、不完整提交 |
| API 集成 | `tests/integration/result-auth.test.ts` | 非会员脱敏 vs 会员完整、无结果 404 |
| E2E | `tests/e2e/full-flow.test.ts` | 全流程：创建→填写→提交→脱敏→支付→完整 |

运行方式：`npm test` 一键全部，`npm run test:unit` / `test:integration` / `test:e2e` 分组。

GitHub Actions 在每次 push 时自动跑 CI。

## 部署

Vercel 单仓部署，`vercel.json` 控制路由：
- `/api/*` → serverless functions（`server/api/` 下每个 .ts 文件）
- 其余 → Vite 静态资源（`client/dist`）

环境变量在 Vercel Dashboard 配置：`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`。

流程：`git push → GitHub → Vercel 自动构建 → 上线到 healthweb.vercel.app`

## 交付物对应

| 笔试要求 | 对应 |
|---|---|
| 公网可访问 URL | Vercel 部署后提供 |
| /pay 可重放调用方式 | README 里贴 cURL |
| 已支付 test session | README 提供测试 userId |
| GitHub 仓库 + README | git push 即可 |
| 自动化测试覆盖 | Vitest + GitHub Actions CI |
| 数据库 Schema 图 | 见本文档第二章节 |
| AI 使用复盘 | 单独交付 |
