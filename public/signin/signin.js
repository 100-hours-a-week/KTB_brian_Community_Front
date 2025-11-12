(() => {
    const form = document.querySelector('.form');
    const btn = document.getElementById('signup-btn');

    /* ===== 프로필: 미리보기 & 클릭 영역 ===== */
    const profileWrap = document.querySelector('.profile__upload');
    const profileInput = document.getElementById('profile');
    const profileImg = document.querySelector('.profile__preview');
    const profileHelper = document.getElementById('profile-help');

    profileInput.addEventListener('change', () => {
        const file = profileInput.files && profileInput.files[0];
        if (!file) { updateSubmitState(); return; }
        const url = URL.createObjectURL(file);
        profileImg.src = url;
        profileImg.onload = () => URL.revokeObjectURL(url);
        profileWrap.classList.add('has-image');
        setProfileHelper(true);
        updateSubmitState();
    });

    function setProfileHelper(ok) {
        if (!ok) {
            profileHelper.style.visibility = 'visible';
            profileHelper.textContent = '*프로필 사진을 추가해주세요.';
        } else {
            profileHelper.style.visibility = 'hidden';
            profileHelper.textContent = '';
        }
    }
    function validateProfile(showMsg = false) {
        const hasImage = profileWrap.classList.contains('has-image');
        if (!hasImage && showMsg) setProfileHelper(false);
        if (hasImage) setProfileHelper(true);
        return hasImage;
    }

    /* ===== 유틸 ===== */
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PW_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/; // 8~20, 대/소/숫/특
    const hasWhitespace = (s) => /\s/.test(s || '');
    const withinLen = (s, max) => (s || '').length <= max;

    function setHelper(fieldEl, helpEl, msg, level = 'error') {
        fieldEl.classList.remove('field--error', 'field--warn', 'field--info');
        helpEl.textContent = '';
        if (level && msg) {
            fieldEl.classList.add(`field--${level}`);
            helpEl.textContent = msg;
        }
    }

    /* ===== 가용성(중복) 체크: 409 처리 포함 ===== */
    function makeAvailabilityChecker(paramKey) {
        let timer = null;
        let controller = null;
        return function (value, cb) {
            clearTimeout(timer);
            if (controller) controller.abort();
            if (!value) { cb({ ok: false, duplicate: false, reason: 'empty' }); return; }
            timer = setTimeout(async () => {
                try {
                    controller = new AbortController();
                    const url = `http://localhost:8080/users/availability?${paramKey}=` + encodeURIComponent(value);
                    const res = await fetch(url, { signal: controller.signal });

                    // 409 → 중복으로 간주
                    if (res.status === 409) { cb({ ok: true, duplicate: true, status: 409 }); return; }

                    // 2xx → JSON 파싱 (예: { available: boolean })
                    if (res.ok) {
                        const data = await res.json().catch(() => ({}));
                        const available = typeof data.available === 'boolean' ? data.available : true;
                        cb({ ok: true, duplicate: available === false, status: res.status });
                        return;
                    }

                    // 그 외 상태코드 → 실패
                    cb({ ok: false, duplicate: false, status: res.status, reason: 'http' });
                } catch (e) {
                    if (e.name === 'AbortError') return;
                    cb({ ok: false, duplicate: false, reason: 'network' });
                }
            }, 300);
        };
    }
    const checkEmailDup = makeAvailabilityChecker('email');
    const checkNickDup = makeAvailabilityChecker('nickname');

    /* ===== 필드 참조 ===== */
    const fieldEmail = document.getElementById('field-email');
    const inputEmail = document.getElementById('email');
    const helpEmail = document.getElementById('email-help');

    const fieldPw = document.getElementById('field-password');
    const inputPw = document.getElementById('password');
    const helpPw = document.getElementById('password-help');

    const fieldPw2 = document.getElementById('field-password2');
    const inputPw2 = document.getElementById('password2');
    const helpPw2 = document.getElementById('password2-help');

    const fieldNick = document.getElementById('field-nickname');
    const inputNick = document.getElementById('nickname');
    const helpNick = document.getElementById('nickname-help');

    /* ===== 검증 로직 ===== */
    function validateEmail({ asyncDupCheck = false, showMsg = false } = {}) {
        const v = (inputEmail.value || '').trim();
        if (!v) { if (showMsg) setHelper(fieldEmail, helpEmail, '*이메일을 입력해주세요.', 'error'); return false; }
        if (v.length < 5 || !EMAIL_RE.test(v)) {
            if (showMsg) setHelper(fieldEmail, helpEmail, '*올바른 이메일 주소 형식을 입력해주세요.(예: example@example.com)', 'error');
            return false;
        }

        // ✅ UI 초기화는 "표시 모드 or 비동기 검사"일 때만
        if (showMsg || asyncDupCheck) {
            setHelper(fieldEmail, helpEmail, null, null);
        }

        if (asyncDupCheck) {
            checkEmailDup(v, (res) => {
                if (!res.ok) {
                    setHelper(fieldEmail, helpEmail, '이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.', 'warn');
                    updateSubmitState();
                    return;
                }
                if (res.duplicate) {
                    setHelper(fieldEmail, helpEmail, '*중복된 이메일입니다.', 'error');
                } else {
                    setHelper(fieldEmail, helpEmail, null, null);
                }
                updateSubmitState();
            });
        }
        return true;
    }


    function validatePassword(showMsg = false) {
        const v = inputPw.value || '';
        if (!v) { if (showMsg) setHelper(fieldPw, helpPw, '*비밀번호를 입력해주세요', 'error'); return false; }
        if (!PW_RE.test(v)) {
            if (showMsg) setHelper(fieldPw, helpPw, '*8~20자, 대문자·소문자·숫자·특수문자 각각 1개 이상 포함해야 합니다.', 'error');
            return false;
        }
        setHelper(fieldPw, helpPw, null, null);
        return true;
    }

    function validatePassword2(showMsg = false) {
        const v2 = inputPw2.value || '';
        const v1 = inputPw.value || '';
        if (!v2) { if (showMsg) setHelper(fieldPw2, helpPw2, '*비밀번호를 한 번 더 입력해주세요', 'error'); return false; }
        if (v2 !== v1) { if (showMsg) setHelper(fieldPw2, helpPw2, '*비밀번호가 다릅니다', 'error'); return false; }
        setHelper(fieldPw2, helpPw2, null, null);
        return true;
    }

    function validateNickname({ asyncDupCheck = false, showMsg = false } = {}) {
        const v = inputNick.value || '';
        if (!v.trim()) { if (showMsg) setHelper(fieldNick, helpNick, '*닉네임을 입력해주세요', 'error'); return false; }
        if (hasWhitespace(v)) { if (showMsg) setHelper(fieldNick, helpNick, '*띄어쓰기를 없애주세요', 'error'); return false; }
        if (!withinLen(v, 10)) { if (showMsg) setHelper(fieldNick, helpNick, '*닉네임은 최대 10자까지 작성 가능합니다', 'error'); return false; }

        // ✅ UI 초기화는 "표시 모드 or 비동기 검사"일 때만
        if (showMsg || asyncDupCheck) {
            setHelper(fieldNick, helpNick, null, null);
        }

        if (asyncDupCheck) {
            checkNickDup(v, (res) => {
                if (!res.ok) {
                    setHelper(fieldNick, helpNick, '닉네임 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.', 'warn');
                    updateSubmitState();
                    return;
                }
                if (res.duplicate) {
                    setHelper(fieldNick, helpNick, '*중복된 닉네임입니다.', 'error');
                } else {
                    setHelper(fieldNick, helpNick, null, null);
                }
                updateSubmitState();
            });
        }
        return true;
    }


    /* ===== 제출 버튼 활성/비활성 ===== */
    function isAllValidSync() {
        const okProfile = profileWrap.classList.contains('has-image');
        const okEmail = validateEmail({ asyncDupCheck: false, showMsg: false });
        const okPw = validatePassword(false);
        const okPw2 = validatePassword2(false);
        const okNick = validateNickname({ asyncDupCheck: false, showMsg: false });

        const hasAnyError =
            document.querySelector('.field.field--error') ||
            (profileHelper.style.visibility === 'visible');

        return okProfile && okEmail && okPw && okPw2 && okNick && !hasAnyError;
    }
    function updateSubmitState() {
        const enabled = isAllValidSync();
        btn.disabled = !enabled;
        btn.classList.toggle('is-active', enabled);
    }

    /* ===== 이벤트 바인딩 ===== */
    inputEmail.addEventListener('blur', () => { validateEmail({ asyncDupCheck: true, showMsg: true }); updateSubmitState(); });
    inputEmail.addEventListener('input', () => { validateEmail({ asyncDupCheck: true, showMsg: false }); updateSubmitState(); });

    inputPw.addEventListener('blur', () => { validatePassword(true); validatePassword2(true); updateSubmitState(); });
    inputPw.addEventListener('input', () => { validatePassword(false); validatePassword2(false); updateSubmitState(); });

    inputPw2.addEventListener('blur', () => { validatePassword2(true); updateSubmitState(); });
    inputPw2.addEventListener('input', () => { validatePassword2(false); updateSubmitState(); });

    inputNick.addEventListener('blur', () => { validateNickname({ asyncDupCheck: true, showMsg: true }); updateSubmitState(); });
    inputNick.addEventListener('input', () => { validateNickname({ asyncDupCheck: true, showMsg: false }); updateSubmitState(); });

    // 초기 상태
    updateSubmitState();

    // ===== API Endpoint =====
    const API_BASE = 'http://localhost:8080';
    const SIGNUP_URL = `${API_BASE}/users`; // 필요 시 수정

    // ... (위쪽 기존 코드 그대로 유지: validate 함수들, updateSubmitState 등)

    /* ===== 폼 제출: FormData로 POST ===== */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 최종 유효성 검사 (헬퍼 표시 모드)
        const ok =
            validateProfile(true) &
            validateEmail({ asyncDupCheck: true, showMsg: true }) &
            validatePassword(true) &
            validatePassword2(true) &
            validateNickname({ asyncDupCheck: true, showMsg: true });

        updateSubmitState();
        if (!isAllValidSync() || !ok) return;

        // FormData 구성
        const fd = new FormData();
        fd.append('email', inputEmail.value.trim());
        fd.append('password', inputPw.value);
        fd.append('nickname', inputNick.value.trim());

        const file = profileInput.files && profileInput.files[0];
        if (file) {
            // 파일 파라미터 이름은 백엔드(@RequestPart("file") 등)와 맞춰야 함
            fd.append('file', file, file.name);
        }

        // 전송 중 상태 처리
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '처리 중...';

        try {
            const res = await fetch(SIGNUP_URL, {
                method: 'POST',
                body: fd,
                // FormData 사용 시 Content-Type 헤더를 수동으로 절대 설정하지 말 것!
                // 브라우저가 boundary 포함하여 자동 설정함.
                headers: {
                    'Accept': 'application/json'
                }
            });

            // 409 → 이메일(혹은 닉네임) 중복으로 간주해 헬퍼와 붉은 테두리 표시
            if (res.status === 409) {
                // 서버에서 어디가 중복인지 메시지를 내려준다 가정. 없으면 이메일 기준으로 표시.
                let msg = '*중복된 정보가 있습니다.';
                try {
                    const data = await res.json();
                    if (data && typeof data.message === 'string') msg = data.message;
                } catch { }

                // 기본: 이메일 중복으로 처리
                setHelper(fieldEmail, helpEmail, '*중복된 이메일입니다.', 'error');
                updateSubmitState();
                return;
            }

            if (!res.ok) {
                // 4xx/5xx 기타 에러 → 메시지 표시(필요시 서버 포맷에 맞게 조정)
                let errMsg = '요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.';
                try {
                    const data = await res.json();
                    if (data && typeof data.message === 'string') errMsg = data.message;
                } catch { }
                // 폼 상단이나 적절한 위치에 경고를 띄우고 싶다면 별도 영역을 만들어서 넣어도 됨
                alert(errMsg);
                return;
            }

            // 200/201 성공 → 후속 동작
            // 필요 시 리다이렉트 또는 성공 토스트 등
            // 예: 회원가입 완료 후 로그인 페이지로
            // window.location.href = '/login';
            alert('회원가입이 완료되었습니다!');

        } catch (err) {
            // 네트워크/예외
            alert('네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.');
        } finally {
            // 버튼 상태 복구 (성공 시에는 리다이렉트로 페이지 이동할 수 있음)
            btn.textContent = originalText;
            updateSubmitState(); // 유효성에 따라 다시 활성/비활성 결정
        }
    });

})();
