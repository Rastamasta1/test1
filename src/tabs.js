// CAROLINE — tabs.js
// Tab switcher: toggles between #add-view and #summary-view based on
// clicks on .tab-btn elements inside #tab-nav (data-view attribute
// holds the target view id). Pure UI-wiring module, no data logic.

const tabButtons = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');

/**
 * Activate the view with the given id, deactivating all others,
 * and sync the .is-active class on the matching tab button.
 * @param {string} viewId - e.g. 'add-view' or 'summary-view'
 */
export function activateView(viewId) {
  views.forEach((view) => {
    view.classList.toggle('is-active', view.id === viewId);
  });
  tabButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === viewId);
  });
}

/**
 * Wire up click handlers on all .tab-btn elements and activate the
 * default view ('add-view') on init. Safe to call once on module load.
 */
export function initTabs(defaultViewId = 'add-view') {
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      activateView(btn.dataset.view);
    });
  });

  activateView(defaultViewId);
}
