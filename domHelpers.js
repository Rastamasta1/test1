// DOM helper utilities for the recipe collection app.
// Pure DOM convenience functions; safe to import anywhere in the browser.

// Query a single element within a root (defaults to document).
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

// Query all matching elements, returned as a real Array.
export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

// Attach an event listener; returns an unsubscribe function.
export function on(target, type, handler, options) {
  if (!target || typeof target.addEventListener !== 'function') return () => {};
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

// Create an element with attributes/props and children.
// props: { class/className, id, text, html, dataset:{}, style:{}, on:{event:fn}, ...attrs }
// children: string | Node | array of them (strings become text nodes).
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  if (props && typeof props === 'object') {
    for (const [key, value] of Object.entries(props)) {
      if (value == null) continue;
      if (key === 'class' || key === 'className') {
        node.className = value;
      } else if (key === 'text' || key === 'textContent') {
        node.textContent = value;
      } else if (key === 'html' || key === 'innerHTML') {
        node.innerHTML = value;
      } else if (key === 'dataset' && typeof value === 'object') {
        for (const [dk, dv] of Object.entries(value)) {
          if (dv != null) node.dataset[dk] = dv;
        }
      } else if (key === 'style' && typeof value === 'object') {
        for (const [sk, sv] of Object.entries(value)) {
          if (sv != null) node.style[sk] = sv;
        }
      } else if (key === 'on' && typeof value === 'object') {
        for (const [ev, fn] of Object.entries(value)) {
          if (typeof fn === 'function') node.addEventListener(ev, fn);
        }
      } else if (key in node) {
        try { node[key] = value; } catch { node.setAttribute(key, value); }
      } else {
        node.setAttribute(key, value);
      }
    }
  }

  appendChildren(node, children);
  return node;
}

// Append one or many children (strings, Nodes, or nested arrays) to a parent.
export function appendChildren(parent, children) {
  if (children == null) return parent;
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) {
      appendChildren(parent, child);
    } else if (child instanceof Node) {
      parent.appendChild(child);
    } else {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
  return parent;
}

// Create a document fragment from a list of children.
export function frag(children = []) {
  const f = document.createDocumentFragment();
  appendChildren(f, children);
  return f;
}

// Remove all child nodes from an element.
export function clearChildren(node) {
  if (!node) return node;
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

// Alias for clearChildren.
export function empty(node) {
  return clearChildren(node);
}

// Set plain text content safely.
export function setText(node, text) {
  if (node) node.textContent = text == null ? '' : String(text);
  return node;
}

// Set inner HTML (use only with trusted/escaped content).
export function setHtml(node, html) {
  if (node) node.innerHTML = html == null ? '' : String(html);
  return node;
}

// Remove a node from the DOM.
export function remove(node) {
  if (node && node.parentNode) node.parentNode.removeChild(node);
  return node;
}

// Show an element (clears inline display:none).
export function show(node, display = '') {
  if (node) node.style.display = display;
  return node;
}

// Hide an element via inline display:none.
export function hide(node) {
  if (node) node.style.display = 'none';
  return node;
}
