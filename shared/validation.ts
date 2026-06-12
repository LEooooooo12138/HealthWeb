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
