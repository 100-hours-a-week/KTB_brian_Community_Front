import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';
import {
  validateEmailValue,
  validatePasswordValue,
  PW_RE,
} from '../../shared/validators.js';

export function validateEmail({ showMsg=false } = {}){
  const v = (DOM.inputEmail.value || '').trim();
  const result = validateEmailValue(v);
  if(!result.valid){
    if(showMsg){
      const msg =
        result.reason === 'pattern'
          ? '*올바른 이메일 주소 형식을 입력해주세요.'
          : '*이메일을 입력해주세요.';
      setFieldHelper(DOM.fieldEmail, DOM.helpEmail, msg, 'error');
    }
    return false;
  }
  if(showMsg) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, null, null);
  return true;
}

export function validatePassword({ showMsg=false } = {}){
  const v = DOM.inputPw.value || '';
  const result = validatePasswordValue(v, {
    minLength: 8,
    maxLength: 20,
    pattern: PW_RE,
  });
  if(!result.valid){
    if(showMsg){
      let msg = '*비밀번호를 입력해주세요.';
      if(result.reason === 'min'){
        msg = '*비밀번호는 8자 이상 입력해주세요.';
      }else if(result.reason === 'max' || result.reason === 'pattern'){
        msg = '*8~20자, 대문자·소문자·숫자·특수문자 각각 1개 이상 포함해야 합니다.';
      }
      setFieldHelper(DOM.fieldPw, DOM.helpPw, msg, 'error');
    }
    return false;
  }
  if(showMsg) setFieldHelper(DOM.fieldPw, DOM.helpPw, null, null);
  return true;
}
