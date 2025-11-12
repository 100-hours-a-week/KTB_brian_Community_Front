(() => {
  const links = document.querySelectorAll('[data-logout]');
  if (!links.length) return;

  function deleteCookie(name) {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; path=/`;
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      // 모든 페이지에서 공통으로 로그인 화면으로 이동
      window.location.href = '../login/index.html';
    });
  });
})();
