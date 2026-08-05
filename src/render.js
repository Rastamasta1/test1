/**
 * src/render.js — pure record markup renderer.
 *
 * Exports:
 *   renderRecords(records, compact) → string
 *     Builds an HTML string for the given records array.
 *     When compact is true, the description element is omitted
 *     but every record card is still rendered.
 */

/**
 * Escape HTML to prevent XSS from record field values.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build a single record card's HTML.
 *
 * @param {{ id: string, name: string, description: string, category: string }} record
 * @param {boolean} compact - when true, description is omitted
 * @returns {string}
 */
function renderRecord(record, compact) {
  const descriptionHtml = compact
    ? ''
    : `<p class="record-description">${escHtml(record.description)}</p>`;

  return `
<article class="record-card" data-id="${escHtml(record.id)}" data-compact="${compact}">
  <div class="record-header">
    <span class="record-category">${escHtml(record.category)}</span>
    <h2 class="record-name">${escHtml(record.name)}</h2>
  </div>
  ${descriptionHtml}
</article>`.trim();
}

/**
 * Render an array of records into an HTML string.
 *
 * @param {Array<{ id: string, name: string, description: string, category: string }>} records
 * @param {boolean} [compact=false] - when true, descriptions are omitted
 * @returns {string} HTML string — safe to set as innerHTML of a container
 */
export function renderRecords(records, compact = false) {
  if (!Array.isArray(records) || records.length === 0) {
    return '<p class="records-empty">No records found.</p>';
  }

  return records.map(record => renderRecord(record, compact)).join('\n');
}
