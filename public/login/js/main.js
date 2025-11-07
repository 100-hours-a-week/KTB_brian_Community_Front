// main.js
import { DOM } from './dom.js';
import { updateSubmitState, hasAnyFieldError, setFieldHelper } from './ui.js';
import { validateEmail, validatePassword } from './validators.js';
import { loginRequest } from './api.js';
import { setCookie } from './utils.js';

function isAllValidSync(){
  const okEmail = validateEmail({ showMsg:false });
  const okPw    = validatePassword({ showMsg:false });
  return okEmail && okPw && !hasAnyFieldError();
}

function bindFieldEvents(){
  DOM.inputEmail.addEventListener('blur',  () => { validateEmail({ showMsg:true  }); updateSubmitState(DOM.btn, isAllValidSync); });
  DOM.inputEmail.addEventListener('input', () => { validateEmail({ showMsg:false }); updateSubmitState(DOM.btn, isAllValidSync); });

  DOM.inputPw.addEventListener('blur',  () => { validatePassword({ showMsg:true  }); updateSubmitState(DOM.btn, isAllValidSync); });
  DOM.inputPw.addEventListener('input', () => { validatePassword({ showMsg:false }); updateSubmitState(DOM.btn, isAllValidSync); });
}

async function handleSubmit(e){
  e.preventDefault();

  const ok =
    validateEmail({ showMsg:true }) &
    validatePassword({ showMsg:true });
  updateSubmitState(DOM.btn, isAllValidSync);
  if(!isAllValidSync() || !ok) return;

  const originalText = DOM.btn.textContent;
  DOM.btn.disabled = true;
  DOM.btn.textContent = '로그인 중...';

  try{
    const res = await loginRequest({ email: DOM.inputEmail.value, password: DOM.inputPw.value });

    if(res.status === 401){
      setFieldHelper(DOM.fieldPw, DOM.helpPw, '이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
      updateSubmitState(DOM.btn, isAllValidSync);
      return;
    }
    if(!res.ok){
      let msg = '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
      try{
        const data = await res.json();
        if(data && typeof data.message === 'string') msg = data.message;
      }catch{}
      alert(msg);
      return;
    }

    // ✅ 성공: JSON 파싱 -> 쿠키 저장 -> 페이지 이동
    const json = await res.json();
    const data = json.data;
    const token     = data.accessToken;
    const expiresIn = Number(data.expiresIn); // 초 단위라고 가정
    const type      = data.type || 'Bearer';

    // 쿠키 저장 (도메인/경로 정책에 맞춰 사용)
    setCookie('accessToken', token,   { maxAge: expiresIn, path: '/' });
    setCookie('tokenType',   type,    { maxAge: expiresIn, path: '/' });

    // 🎯 목록 페이지로 이동 (경로는 프로젝트 구조에 맞게 조정)
    window.location.href = '../../com/board_com.html';

  }catch(err){
    alert('네트워크 오류가 발생했습니다.');
  }finally{
    DOM.btn.textContent = originalText;
    updateSubmitState(DOM.btn, isAllValidSync);
  }
}

function init(){
  bindFieldEvents();
  DOM.form.addEventListener('submit', handleSubmit);
  updateSubmitState(DOM.btn, isAllValidSync);
}
init();
