// Lightweight accessible modal dialog system.
// Builds an overlay + dialog with focus trapping, ESC to close, and
// a small form-field helper used by interactions.ts.

export interface ModalField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number';
  value?: string;
  required?: boolean;
  placeholder?: string;
}

export interface ModalOptions {
  title: string;
  fields?: ModalField[];
  confirmText?: string;
  cancelText?: string;
  /** Optional message shown above fields (e.g. for confirm dialogs). */
  message?: string;
  /** Style the confirm button as a danger action. */
  danger?: boolean;
}

export type ModalResult = Record<string, string> | null;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/**
 * Open a modal and resolve with the collected field values on confirm,
 * or null on cancel/close.
 */
export function openModal(opts: ModalOptions): Promise<ModalResult> {
  return new Promise((resolve) => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const overlay = el('div', 'modal-overlay', { role: 'presentation' });
    const dialog = el('div', 'modal', {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': opts.title,
    });

    const header = el('div', 'modal__header');
    const titleEl = el('h2', 'modal__title');
    titleEl.textContent = opts.title;
    header.appendChild(titleEl);
    dialog.appendChild(header);

    const form = el('form', 'modal__form');

    if (opts.message) {
      const msg = el('p', 'modal__message');
      msg.textContent = opts.message;
      form.appendChild(msg);
    }

    const inputs: Array<HTMLInputElement | HTMLTextAreaElement> = [];
    for (const field of opts.fields ?? []) {
      const wrap = el('div', 'modal__field');
      const id = `modal-field-${field.name}`;
      const label = el('label', 'modal__label', { for: id });
      label.textContent = field.label;
      wrap.appendChild(label);

      let input: HTMLInputElement | HTMLTextAreaElement;
      if (field.type === 'textarea') {
        input = el('textarea', 'modal__input', { id, name: field.name });
      } else {
        input = el('input', 'modal__input', {
          id,
          name: field.name,
          type: field.type ?? 'text',
        });
      }
      if (field.value != null) input.value = field.value;
      if (field.required) input.required = true;
      if (field.placeholder) input.setAttribute('placeholder', field.placeholder);
      wrap.appendChild(input);
      form.appendChild(wrap);
      inputs.push(input);
    }

    const actions = el('div', 'modal__actions');
    const cancelBtn = el('button', 'btn btn--ghost', { type: 'button' });
    cancelBtn.textContent = opts.cancelText ?? 'Cancel';
    const confirmBtn = el('button', `btn ${opts.danger ? 'btn--danger' : 'btn--primary'}`, {
      type: 'submit',
    });
    confirmBtn.textContent = opts.confirmText ?? 'Save';
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    form.appendChild(actions);

    dialog.appendChild(form);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    function cleanup(): void {
      document.removeEventListener('keydown', onKeydown, true);
      overlay.remove();
      previouslyFocused?.focus?.();
    }

    function close(result: ModalResult): void {
      cleanup();
      resolve(result);
    }

    function collect(): Record<string, string> {
      const data: Record<string, string> = {};
      for (const field of opts.fields ?? []) {
        const input = inputs.find((i) => i.name === field.name);
        data[field.name] = input ? input.value.trim() : '';
      }
      return data;
    }

    function getFocusable(): HTMLElement[] {
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    function onKeydown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(null);
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay) close(null);
    });
    cancelBtn.addEventListener('click', () => close(null));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Native validation for required fields.
      if (!form.reportValidity()) return;
      close(collect());
    });
    document.addEventListener('keydown', onKeydown, true);

    // Initial focus.
    const firstInput = inputs[0] ?? confirmBtn;
    firstInput.focus();
  });
}

/** Convenience confirm dialog. Resolves true on confirm. */
export async function confirmModal(
  title: string,
  message: string,
  confirmText = 'Delete'
): Promise<boolean> {
  const result = await openModal({
    title,
    message,
    confirmText,
    danger: true,
  });
  return result !== null;
}
