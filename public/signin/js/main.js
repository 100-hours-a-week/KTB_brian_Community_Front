import { DOM } from './dom.js';
import { buildFormData } from './utils.js';
import { updateSubmitState, hasAnyFieldError, setFieldHelper, setProfileHelper } from './ui.js';
import { checkEmailDup, checkNickDup } from './availability.js';
import {
  makeProfileValidator,
  makeEmailValidator,
  makePasswordValidator,
  makePasswordConfirmValidator,
  makeNicknameValidator,
} from '../../shared/validators.js';
import { submitSignIn } from '../../shared/api/user.js';
import { MSG, ERR } from '../../shared/constants/messages.js';

const validateProfile = makeProfileValidator({
  hasImageFn: () => DOM.profileWrap.classList.contains('has-image'),
  setProfileHelper,
});
const validateEmailSync = makeEmailValidator({
  inputEl: DOM.inputEmail,
  fieldEl: DOM.fieldEmail,
  helpEl: DOM.helpEmail,
  setHelper: setFieldHelper,
});
const validatePasswordSync = makePasswordValidator({
  inputEl: DOM.inputPw,
  fieldEl: DOM.fieldPw,
  helpEl: DOM.helpPw,
  setHelper: setFieldHelper,
});
const validatePassword2Sync = makePasswordConfirmValidator({
  passwordInputEl: DOM.inputPw,
  confirmInputEl: DOM.inputPw2,
  fieldEl: DOM.fieldPw2,
  helpEl: DOM.helpPw2,
  setHelper: setFieldHelper,
});
const validateNicknameSync = makeNicknameValidator({
  inputEl: DOM.inputNick,
  fieldEl: DOM.fieldNick,
  helpEl: DOM.helpNick,
  setHelper: setFieldHelper,
});

function validateEmailAsyncDup(onDone) {
  const v = (DOM.inputEmail.value || '').trim();
  checkEmailDup(v, (res) => {
    if (!res.ok) {
      setFieldHelper(
        DOM.fieldEmail,
        DOM.helpEmail,
        ERR.DUP_EMAIL_FAIL,
        'warn',
      );
      onDone?.();
      return;
    }
    if (res.duplicate) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, ERR.DUP_EMAIL, 'error');
    else setFieldHelper(DOM.fieldEmail, DOM.helpEmail, null, null);
    onDone?.();
  });
}

function validateNicknameAsyncDup(onDone) {
  const v = DOM.inputNick.value || '';
  checkNickDup(v, (res) => {
    if (!res.ok) {
      setFieldHelper(
        DOM.fieldNick,
        DOM.helpNick,
        ERR.DUP_NICK_FAIL,
        'warn',
      );
      onDone?.();
      return;
    }
    if (res.duplicate) setFieldHelper(DOM.fieldNick, DOM.helpNick, ERR.DUP_NICK, 'error');
    else setFieldHelper(DOM.fieldNick, DOM.helpNick, null, null);
    onDone?.();
  });
}

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
    if (!file) {
      DOM.profileWrap.classList.remove('has-image');
      setProfileHelper(true);
      updateSubmitState(isAllValidSync);
      return;
    }
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

  const okProfile = validateProfile({ showMsg:true });
  const okEmail   = validateEmailSync({ showMsg:true });
  const okPw      = validatePasswordSync({ showMsg:true });
  const okPw2     = validatePassword2Sync({ showMsg:true });
  const okNick    = validateNicknameSync({ showMsg:true });
  const allValid  = okProfile && okEmail && okPw && okPw2 && okNick && !hasAnyFieldError();

  updateSubmitState(() => allValid);
  if (!allValid) return;

  const fd = buildFormData({
    email:    DOM.inputEmail.value,
    password: DOM.inputPw.value,
    nickname: DOM.inputNick.value,
    file:     DOM.profileInput.files && DOM.profileInput.files[0],
  });

  const originalText = DOM.btn.textContent;
  DOM.btn.disabled = true;
  DOM.btn.textContent = MSG.PROCESSING;

  try {
    const res = await submitSignIn(fd);

    if (res.status === 409) {
      let msg = ERR.DUP_INFO_DEFAULT;
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') msg = data.message;
      } catch {}
      // 기본: 이메일 중복으로 표시
      setFieldHelper(DOM.fieldEmail, DOM.helpEmail, ERR.DUP_EMAIL, 'error');
      updateSubmitState(isAllValidSync);
      return;
    }

    if (!res.ok) {
      let errMsg = ERR.REQUEST_RETRY;
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') errMsg = data.message;
      } catch {}
      alert(errMsg);
      return;
    }

    alert(MSG.SIGNUP_SUCCESS);
    window.location.href = '../login/index.html';

  } catch (err) {
    alert(ERR.NETWORK);
  } finally {
    DOM.btn.textContent = originalText;
    updateSubmitState(isAllValidSync);
  }
}

function initBackButton() {
  DOM.backBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '../login/index.html';
  });
}

function init() {
  initProfilePicker();
  initBackButton();
  initFieldEvents();
  setProfileHelper(true);
  updateSubmitState(isAllValidSync);
}

// Boot
init();
