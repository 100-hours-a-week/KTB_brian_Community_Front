// main.js
import { DOM } from './dom.js';
import { updateSubmitState, hasAnyFieldError, setFieldHelper } from './ui.js';
import { makeEmailValidator, makePasswordValidator } from '../../shared/validators.js';
import { loginRequest } from '../../shared/api/auth.js';
import { setCookie } from './utils.js';

const validateEmail = makeEmailValidator({
  inputEl: DOM.inputEmail,
  fieldEl: DOM.fieldEmail,
  helpEl: DOM.helpEmail,
  setHelper: setFieldHelper,
});
const validatePassword = makePasswordValidator({
  inputEl: DOM.inputPw,
  fieldEl: DOM.fieldPw,
  helpEl: DOM.helpPw,
  setHelper: setFieldHelper,
});

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

    if(!res.ok){
      setFieldHelper(DOM.fieldPw, DOM.helpPw, '*아이디 또는 비밀번호를 확인해주세요.', 'error');
      updateSubmitState(DOM.btn, isAllValidSync);
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
    window.location.href = '../board/index.html';

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
