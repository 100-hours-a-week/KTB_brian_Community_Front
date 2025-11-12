export function setFieldHelper(fieldEl, helpEl, msg, level='error'){
  fieldEl.classList.remove('field--error','field--warn','field--info');
  helpEl.textContent = '';
  if(level && msg){
    fieldEl.classList.add(`field--${level}`);
    helpEl.textContent = msg;
  }
}

export function hasAnyFieldError(){
  return Boolean(document.querySelector('.field.field--error'));
}

export function updateSubmitState(btn, isAllValidFn){
  const enabled = isAllValidFn();
  btn.disabled = !enabled;
}
