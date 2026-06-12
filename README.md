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

环境变量（在 Vercel Dashboard 配置）：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
