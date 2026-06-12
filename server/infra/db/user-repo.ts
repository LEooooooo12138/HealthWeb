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
