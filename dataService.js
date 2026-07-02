import { supabase } from './supabaseClient.js';

// Fetch all guestbook messages, newest first.
export async function fetchMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchMessages error:', error);
    throw error;
  }

  return data || [];
}

// Insert a new guestbook message.
export async function insertMessage(name, message) {
  const trimmedName = (name || '').trim();
  const trimmedMessage = (message || '').trim();

  if (!trimmedName || !trimmedMessage) {
    throw new Error('Both name and message are required.');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ name: trimmedName, message: trimmedMessage })
    .select('id, name, message, created_at')
    .single();

  if (error) {
    console.error('insertMessage error:', error);
    throw error;
  }

  return data;
}
