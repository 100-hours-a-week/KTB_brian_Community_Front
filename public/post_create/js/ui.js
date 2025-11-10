export function setFieldHelper(fieldEl, helperEl, msg, level = 'error') {
  if (!fieldEl || !helperEl) return;
  fieldEl.classList.remove('field--error', 'field--warn', 'field--info');
  helperEl.textContent = '';
  if (level && msg) {
    fieldEl.classList.add(`field--${level}`);
    helperEl.textContent = msg;
  }
}

export function updateSubmitState(btn, isAllValidFn) {
  if (!btn || typeof isAllValidFn !== 'function') return;
  const enabled = isAllValidFn();
  btn.disabled = !enabled;
  btn.classList.toggle('is-active', enabled);
}
