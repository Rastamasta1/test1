import { supabase } from './supabaseClient.js';

export async function addMessage(name, message) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ name, message }])
    .select();
  if (error) throw error;
  return data;
}

export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
