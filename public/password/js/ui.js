import { DOM } from './dom.js';

const TOAST_DURATION_MS = 2500;

export function setFieldHelper(fieldEl, helperEl, msg, level = 'error') {
  if (!fieldEl || !helperEl) return;
  fieldEl.classList.remove('field--error', 'field--warn', 'field--info');
  helperEl.textContent = '';
  if (level && msg) {
    fieldEl.classList.add(`field--${level}`);
    helperEl.textContent = msg;
  }
}

export function updateSubmitState(isAllValidFn) {
  if (!DOM.submitBtn) return;
  const enabled = isAllValidFn();
  DOM.submitBtn.disabled = !enabled;
  DOM.submitBtn.classList.toggle('is-active', enabled);
}

export function showToast() {
  if (!DOM.toast) return;
  DOM.toast.classList.add('is-visible');
  setTimeout(() => DOM.toast.classList.remove('is-visible'), TOAST_DURATION_MS);
}
