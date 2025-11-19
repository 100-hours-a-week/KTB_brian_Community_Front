// DOM 캐시를 한 곳에서 관리
export const DOM = {
  form:        document.querySelector('.form'),
  btn:         document.getElementById('signup-btn'),

  // profile
  profileWrap:   document.querySelector('.profile__upload'),
  profileInput:  document.getElementById('profile'),
  profileHelper: document.getElementById('profile-help'),

  // email
  fieldEmail: document.getElementById('field-email'),
  inputEmail: document.getElementById('email'),
  helpEmail:  document.getElementById('email-help'),

  // password
  fieldPw: document.getElementById('field-password'),
  inputPw: document.getElementById('password'),
  helpPw:  document.getElementById('password-help'),

  // password2
  fieldPw2: document.getElementById('field-password2'),
  inputPw2: document.getElementById('password2'),
  helpPw2:  document.getElementById('password2-help'),

  // nickname
  fieldNick: document.getElementById('field-nickname'),
  inputNick: document.getElementById('nickname'),
  helpNick:  document.getElementById('nickname-help'),

  // nav
  backBtn: document.getElementById('signin-back-btn'),
};
