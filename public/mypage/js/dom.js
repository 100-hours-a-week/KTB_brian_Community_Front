export const DOM = {
  form: document.querySelector('.form'),
  emailInput: document.getElementById('email'),
  nicknameField: document.getElementById('field-nickname'),
  nicknameInput: document.getElementById('nickname'),
  nicknameHelper: document.getElementById('nickname-help'),
  submitBtn:
    document.querySelector('.form .btn.btn--primary[type="submit"]') ||
    document.querySelector('.form .btn.btn--primary'),
  fileInput: document.getElementById('profile-file-input'),
};
