export function setFieldHelper(fieldEl, helperEl, msg, level = 'error') {
  if (!fieldEl || !helperEl) return;
  fieldEl.classList.remove('field--error', 'field--warn', 'field--info');
  helperEl.textContent = '';
  if (level && msg) {
    fieldEl.classList.add(`field--${level}`);
    helperEl.textContent = msg;
  }
}
