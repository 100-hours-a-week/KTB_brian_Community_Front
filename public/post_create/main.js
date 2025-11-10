const form = document.getElementById('post-form');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const imageInput = document.getElementById('image');
const submitBtn = document.getElementById('submit-btn');
const helpTitle = document.getElementById('title-help');
const helpBody = document.getElementById('body-help');

function setHelper(el, msg = '') {
    el.textContent = msg;
}

function isFormValid() {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    const valid = title.length > 0 && body.length > 0 && title.length <= 26;
    submitBtn.disabled = !valid;
    submitBtn.classList.toggle('active', valid);
    return valid;
}

// 실시간 유효성 검사
titleInput.addEventListener('input', () => {
    if (titleInput.value.length > 26) {
        setHelper(helpTitle, '*제목은 최대 26자까지 가능합니다.');
    } else if (titleInput.value.trim().length === 0) {
        setHelper(helpTitle, '*제목을 입력해주세요.');
    } else {
        setHelper(helpTitle, '');
    }
    isFormValid();
});

bodyInput.addEventListener('input', () => {
    if (bodyInput.value.trim().length === 0) {
        setHelper(helpBody, '*내용을 입력해주세요.');
    } else {
        setHelper(helpBody, '');
    }
    isFormValid();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const fd = new FormData();
    fd.append('title', titleInput.value.trim());
    fd.append('body', bodyInput.value.trim());
    if (imageInput.files[0]) fd.append('image', imageInput.files[0]);

    try {
        const res = await fetch('http://localhost:8080/posts', {
            method: 'POST',
            body: fd,
            headers: {
                'Authorization': `Bearer ${getCookie('accessToken')}`,
            },
        });

        if (!res.ok) {
            alert('게시글 등록 실패');
            return;
        }

        alert('게시글이 등록되었습니다!');
        window.location.href = '/public/com/board_com.html';
    } catch (err) {
        alert('네트워크 오류가 발생했습니다.');
    }
});

// 쿠키 읽기 헬퍼
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}
