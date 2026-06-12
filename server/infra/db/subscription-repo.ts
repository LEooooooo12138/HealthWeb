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
    if (error.code === 'PGRST116') return null;
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
