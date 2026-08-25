/**
 * src/render.js — builds the record list DOM for the compact page.
 *
 * Exports:
 *   renderRecords(records, {compact}) → HTMLElement
 *     Returns a fresh <ul class="record-list"> containing one
 *     <li class="record-item"> per record, in the given order.
 *
 * Every record in the input array is always listed, regardless of the
 * compact flag. When compact is true, each record's description element
 * is simply not created/appended — the name (and every other record)
 * still renders. This keeps the compact/non-compact behavior a pure
 * function of {records, compact} → DOM, with no hidden state.
 */

/**
 * Build the record list DOM.
 *
 * @param {Array<{id:(number|string), name:string, description:string, quantity?:number}>} records
 * @param {{compact?: boolean}} [options]
 * @returns {HTMLElement} a <ul> element containing one <li> per record
 */
export function renderRecords(records, { compact = false } = {}) {
  const list = document.createElement('ul');
  list.className = 'record-list';

  (records || []).forEach(record => {
    const item = document.createElement('li');
    item.className = 'record-item';
    if (record && record.id !== undefined) {
      item.dataset.id = String(record.id);
    }

    const name = document.createElement('span');
    name.className = 'record-name';
    name.textContent = record ? record.name : '';
    item.appendChild(name);

    // Description is omitted entirely from the DOM when compact — not
    // merely CSS-hidden — while the record itself stays listed above.
    if (!compact) {
      const desc = document.createElement('p');
      desc.className = 'record-description';
      desc.textContent = record ? record.description : '';
      item.appendChild(desc);
    }

    list.appendChild(item);
  });

  return list;
}
