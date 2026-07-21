// CAROLINE — app.js
// Main UI controller entry point.
// Sample data seeding (first-load only, via a 'seeded' flag key) lives
// in src/sampleData.js and must run before any view reads from storage,
// so it is imported first, ahead of the Add/Summary view modules.
// Tab switching between #add-view and #summary-view lives in
// src/tabs.js (imported and initialized here). The Add-expense form
// logic lives in src/addForm.js (imported for its side effect of
// wiring up the form and rendering the expense list). The Summary
// view's category bars, grand total, and month selector live in
// src/summaryView.js (imported for its side effect of rendering and
// wiring the summary view), driven by the pure logic in src/summary.js.

import './sampleData.js';
import './addForm.js';
import './summaryView.js';
import { initTabs } from './tabs.js';

// Default view on load: 'add-view'
initTabs('add-view');
