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
