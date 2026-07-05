// Feedback data service for the feedback wall app
import { supabase } from './supabaseClient.js';

// Insert a new feedback row. Columns match schema.sql: name, rating, comment
export async function insertFeedback(name, rating, comment) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ name, rating, comment })
    .select();

  if (error) throw error;
  return data;
}

// Fetch all feedback, newest first
export async function getFeedback() {
  const { data, error } = await supabase
    .from('feedback')
    .select('id, name, rating, comment, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Alias: fetch every feedback row (newest first). Same as getFeedback.
export async function fetchAllFeedback() {
  return getFeedback();
}
