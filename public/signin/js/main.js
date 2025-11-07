import { DOM } from './dom.js';
import { buildFormData } from './utils.js';
import { updateSubmitState, hasAnyFieldError, setFieldHelper } from './ui.js';
import {
  validateProfile,
  validateEmailSync, validateEmailAsyncDup,
  validatePasswordSync, validatePassword2Sync,
  validateNicknameSync, validateNicknameAsyncDup
} from './validators.js';
import { submitSignIn } from './api.js';

function isAllValidSync() {
  const okProfile = DOM.profileWrap.classList.contains('has-image');
  const okEmail   = validateEmailSync({ showMsg:false });
  const okPw      = validatePasswordSync({ showMsg:false });
  const okPw2     = validatePassword2Sync({ showMsg:false });
  const okNick    = validateNicknameSync({ showMsg:false });
  return okProfile && okEmail && okPw && okPw2 && okNick && !hasAnyFieldError();
}

function initProfilePicker() {
  DOM.profileInput.addEventListener('change', () => {
    const file = DOM.profileInput.files && DOM.profileInput.files[0];
    if (!file) { updateSubmitState(isAllValidSync); return; }
    const url = URL.createObjectURL(file);
    DOM.profileImg.src = url;
    DOM.profileImg.onload = () => URL.revokeObjectURL(url);
    DOM.profileWrap.classList.add('has-image');
    // 메시지 숨김
    validateProfile({ showMsg:false });
    updateSubmitState(isAllValidSync);
  });
}

function initFieldEvents() {
  // 이메일
  DOM.inputEmail.addEventListener('blur',  () => {
    if (validateEmailSync({ showMsg:true })) validateEmailAsyncDup(() => updateSubmitState(isAllValidSync));
    else updateSubmitState(isAllValidSync);
  });
  DOM.inputEmail.addEventListener('input', () => {
    if (validateEmailSync({ showMsg:false })) validateEmailAsyncDup(() => updateSubmitState(isAllValidSync));
    else updateSubmitState(isAllValidSync);
  });

  // 비밀번호 / 확인
  DOM.inputPw.addEventListener('blur',  () => { validatePasswordSync({ showMsg:true });  validatePassword2Sync({ showMsg:true });  updateSubmitState(isAllValidSync); });
  DOM.inputPw.addEventListener('input', () => { validatePasswordSync({ showMsg:false }); validatePassword2Sync({ showMsg:false }); updateSubmitState(isAllValidSync); });

  DOM.inputPw2.addEventListener('blur',  () => { validatePassword2Sync({ showMsg:true });  updateSubmitState(isAllValidSync); });
  DOM.inputPw2.addEventListener('input', () => { validatePassword2Sync({ showMsg:false }); updateSubmitState(isAllValidSync); });

  // 닉네임
  DOM.inputNick.addEventListener('blur',  () => {
    if (validateNicknameSync({ showMsg:true })) validateNicknameAsyncDup(() => updateSubmitState(isAllValidSync));
    else updateSubmitState(isAllValidSync);
  });
  DOM.inputNick.addEventListener('input', () => {
    if (validateNicknameSync({ showMsg:false })) validateNicknameAsyncDup(() => updateSubmitState(isAllValidSync));
    else updateSubmitState(isAllValidSync);
  });

  // 제출
  DOM.form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();

  const ok = (
    validateProfile({ showMsg:true }) &
    validateEmailSync({ showMsg:true }) &
    validatePasswordSync({ showMsg:true }) &
    validatePassword2Sync({ showMsg:true }) &
    validateNicknameSync({ showMsg:true })
  );
  updateSubmitState(isAllValidSync);
  if (!isAllValidSync() || !ok) return;

  const fd = buildFormData({
    email:    DOM.inputEmail.value,
    password: DOM.inputPw.value,
    nickname: DOM.inputNick.value,
    file:     DOM.profileInput.files && DOM.profileInput.files[0],
  });

  const originalText = DOM.btn.textContent;
  DOM.btn.disabled = true;
  DOM.btn.textContent = '처리 중...';

  try {
    const res = await submitSignIn(fd);

    if (res.status === 409) {
      let msg = '*중복된 정보가 있습니다.';
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') msg = data.message;
      } catch {}
      // 기본: 이메일 중복으로 표시
      setFieldHelper(DOM.fieldEmail, DOM.helpEmail, '*중복된 이메일입니다.', 'error');
      updateSubmitState(isAllValidSync);
      return;
    }

    if (!res.ok) {
      let errMsg = '요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.';
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') errMsg = data.message;
      } catch {}
      alert(errMsg);
      return;
    }

    alert('회원가입이 완료되었습니다!');
    // window.location.href = '/login';

  } catch (err) {
    alert('네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.');
  } finally {
    DOM.btn.textContent = originalText;
    updateSubmitState(isAllValidSync);
  }
}

function init() {
  initProfilePicker();
  initFieldEvents();
  updateSubmitState(isAllValidSync);
}

// Boot
init();
