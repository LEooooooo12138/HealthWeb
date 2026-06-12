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
