// CAROLINE — main.js
// Consolidated INFRA entry point: imports every core module (data layer,
// sample-data seeding, Add-view form + list, pure summary logic, and the
// tab switcher), then initializes the app.
//
// Note: storage.js, expenseList.js, and summary.js are pure/rendering
// modules with no top-level init side effects of their own — they're
// imported here (and consumed by addForm.js / summaryView.js) so this
// file has an explicit, single-glance view of the app's full module
// graph. sampleData.js seeds sample expenses on first load only (guarded
// by a dedicated 'seeded' flag key, per operator guidance), and must run
// before addForm.js/summaryView.js read from storage — so it is imported
// first, ahead of them. addForm.js and summaryView.js each wire
// themselves up as an import side effect (initAddForm() / initSummaryView()
// run at module load), so all that remains here is starting the tab
// switcher with the default view.

import './storage.js';
import './sampleData.js';
import './addForm.js';
import './expenseList.js';
import './summary.js';
import { initTabs } from './tabs.js';

// Default view on load: 'add-view'
initTabs('add-view');
