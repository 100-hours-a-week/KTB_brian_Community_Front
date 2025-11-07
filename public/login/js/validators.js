import { DOM } from './dom.js';
import { EMAIL_RE } from './utils.js';
import { setFieldHelper } from './ui.js';

export function validateEmail({ showMsg=false } = {}){
  const v = (DOM.inputEmail.value || '').trim();
  if(!v){ if(showMsg) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, '*이메일을 입력해주세요.', 'error'); return false; }
  if(!EMAIL_RE.test(v)){ if(showMsg) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, '*올바른 이메일 주소 형식을 입력해주세요.', 'error'); return false; }
  if(showMsg) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, null, null);
  return true;
}

export function validatePassword({ showMsg=false } = {}){
  const v = DOM.inputPw.value || '';
  if(!v){ if(showMsg) setFieldHelper(DOM.fieldPw, DOM.helpPw, '*비밀번호를 입력해주세요.', 'error'); return false; }
  if(showMsg) setFieldHelper(DOM.fieldPw, DOM.helpPw, null, null);
  return true;
}
