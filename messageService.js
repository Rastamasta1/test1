// Message data service.
// Handles all Supabase reads/writes for the messages table.
// Column names match schema.sql exactly: name, message, created_at.
import { supabase } from './supabaseClient.js';

// Insert a new message. Returns { data, error }.
export async function addMessage(name, message) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ name, message }])
    .select();
  return { data, error };
}

// Fetch all messages, newest first. Returns { data, error }.
export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false });
  return { data, error };
}
