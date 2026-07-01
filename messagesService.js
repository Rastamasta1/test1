// Messages data service
// Provides insert + select operations against the `messages` table.
import { supabase } from './supabaseClient.js';

/**
 * Fetch messages ordered by newest first.
 * @param {number} [limit=100] - Max number of messages to return.
 * @returns {Promise<Array>} Array of message rows.
 */
export async function fetchMessages(limit = 100) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, author, content, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
  return data || [];
}

/**
 * Insert a new message.
 * @param {string} content - Message content (required, non-empty).
 * @param {string} [author='anonymous'] - Message author.
 * @returns {Promise<Object>} The inserted message row.
 */
export async function addMessage(content, author = 'anonymous') {
  const trimmedContent = (content || '').trim();
  if (!trimmedContent) {
    throw new Error('Message content cannot be empty.');
  }

  const trimmedAuthor = (author || '').trim() || 'anonymous';

  const { data, error } = await supabase
    .from('messages')
    .insert({ content: trimmedContent, author: trimmedAuthor })
    .select('id, author, content, created_at')
    .single();

  if (error) {
    throw new Error(`Failed to add message: ${error.message}`);
  }
  return data;
}

export default { fetchMessages, addMessage };
