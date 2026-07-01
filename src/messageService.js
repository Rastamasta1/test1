import { supabase } from './supabaseClient.js';

// Insert a new message into the messages table.
// Returns the inserted row on success; throws on error.
export async function addMessage(name, message) {
  const trimmedName = (name || '').trim();
  const trimmedMessage = (message || '').trim();

  if (!trimmedName || !trimmedMessage) {
    throw new Error('Both name and message are required.');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ name: trimmedName, message: trimmedMessage })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Select all messages, newest first.
export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
