import { supabase } from './supabaseClient.js';

// Unified task query helper.
// options: { status: 'active'|'completed'|'all', priority: 'low'|'medium'|'high'|null,
//            sortBy: 'due_date'|'created_at'|'priority', ascending: true }
export async function queryTasks({
  status = 'all',
  priority = null,
  sortBy = 'due_date',
  ascending = true
} = {}) {
  let query = supabase.from('tasks').select('*');

  if (status === 'active') query = query.eq('done', false);
  else if (status === 'completed') query = query.eq('done', true);

  if (priority) query = query.eq('priority', priority);

  const validSorts = ['due_date', 'created_at', 'priority', 'title'];
  const column = validSorts.includes(sortBy) ? sortBy : 'due_date';

  query = query.order(column, { ascending, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Active tasks sorted by due date (soonest first). Optional priority filter.
export async function getActiveByDueDate({ priority = null } = {}) {
  return queryTasks({ status: 'active', priority, sortBy: 'due_date', ascending: true });
}

// Completed tasks, most recently created first. Optional priority filter.
export async function getCompletedByRecent({ priority = null } = {}) {
  return queryTasks({ status: 'completed', priority, sortBy: 'created_at', ascending: false });
}

// Priority weighting for client-side sort where DB text ordering is not ideal.
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

// Sort an already-fetched array of tasks by priority (high first) then due date.
export function sortByPriorityThenDue(tasks = []) {
  return [...tasks].sort((a, b) => {
    const pw = (PRIORITY_WEIGHT[a.priority] ?? 3) - (PRIORITY_WEIGHT[b.priority] ?? 3);
    if (pw !== 0) return pw;
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

// Filter an already-fetched array of tasks by priority.
export function filterByPriority(tasks = [], priority = null) {
  if (!priority) return tasks;
  return tasks.filter((t) => t.priority === priority);
}
