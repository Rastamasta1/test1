// Small helper to compute live task counts for the tab labels.
// Reuses queryTasks so counts respect the active priority filter.

import { queryTasks } from './taskQueries.js';

// Returns { active, completed } counts, optionally filtered by priority.
export async function getTaskCounts({ priority = null } = {}) {
  const [active, completed] = await Promise.all([
    queryTasks({ status: 'active', priority }),
    queryTasks({ status: 'completed', priority })
  ]);
  return { active: active.length, completed: completed.length };
}
