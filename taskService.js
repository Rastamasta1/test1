import { supabase } from './supabaseClient.js';

// Fetch all tasks, optionally filtered by priority.
export async function getTasks({ priority = null } = {}) {
  let query = supabase.from('tasks').select('*');
  if (priority) query = query.eq('priority', priority);
  const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

// Fetch active (not done) tasks, sorted by due date. Optional priority filter.
export async function getActiveTasks({ priority = null } = {}) {
  let query = supabase.from('tasks').select('*').eq('done', false);
  if (priority) query = query.eq('priority', priority);
  const { data, error } = await query.order('due_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

// Fetch completed (done) tasks. Optional priority filter.
export async function getCompletedTasks({ priority = null } = {}) {
  let query = supabase.from('tasks').select('*').eq('done', true);
  if (priority) query = query.eq('priority', priority);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Create a new task. Expects { title, description, priority, due_date }.
export async function createTask({ title, description = '', priority = 'medium', due_date = null }) {
  const payload = {
    title,
    description,
    priority,
    due_date: due_date || null
  };
  const { data, error } = await supabase.from('tasks').insert(payload).select().single();
  if (error) throw error;
  return data;
}

// Update an existing task by id with a partial patch.
export async function updateTask(id, patch) {
  const allowed = ['title', 'description', 'priority', 'due_date', 'done'];
  const updates = {};
  for (const key of allowed) {
    if (key in patch) updates[key] = patch[key];
  }
  if ('due_date' in updates && !updates.due_date) updates.due_date = null;
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Toggle or set the done state of a task.
export async function toggleDone(id, done) {
  const { data, error } = await supabase.from('tasks').update({ done }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Delete a task by id.
export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
  return true;
}
