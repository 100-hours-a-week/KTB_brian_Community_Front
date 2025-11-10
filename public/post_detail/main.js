/* Utilities */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

/* 숫자 포맷: 1,000→1k / 10,000→10k / 100,000→100k */
function formatCount(n){
    const x = Number(n)||0;
    if(x>=100000) return `${Math.floor(x/1000)}k`;
    if(x>=10000)  return `${Math.floor(x/1000)}k`;
    if(x>=1000)   return `${Math.floor(x/1000)}k`;
    return String(x);
}
function renderCounts(){
    $$('#likeNum,#viewNum,#commentNum').forEach(el=>{
        el.textContent = formatCount(el.dataset.count);
    });
}

/* 좋아요 토글: 색상 전환 + +1/-1 */
function bindLike(){
    const btn = $('#likeBtn');
    const num = $('#likeNum');
    btn.addEventListener('click', ()=>{
        const liked = btn.dataset.liked === 'true';
        const cur   = Number(num.dataset.count)||0;
        const next  = liked ? Math.max(0, cur-1) : cur+1;
        num.dataset.count = String(next);
        num.textContent   = formatCount(next);
        btn.dataset.liked = String(!liked);
        btn.setAttribute('aria-pressed', String(!liked));
    });
}

/* 댓글 입력 활성화 */
function bindCommentWrite(){
    const input = $('#commentInput');
    const submit = $('#commentSubmit');
    input.addEventListener('input', ()=>{
        submit.disabled = input.value.trim().length === 0;
    });
    submit.addEventListener('click', ()=>{
        if(submit.disabled) return;
        // 실제 등록은 API 연동 지점.
        const list = $('.comments');
        const item = document.createElement('article');
        item.className = 'comment';
        item.innerHTML = `
      <div class="comment__meta">
        <span class="author__avatar" aria-hidden="true"></span>
        <span class="author__name">나</span>
        <time class="comment__time">${new Date().toISOString().slice(0,16).replace('T',' ')}</time>
      </div>
      <div class="comment__body"></div>
      <div class="comment__actions">
        <button class="chip chip--ghost" data-action="edit">수정</button>
        <button class="chip chip--ghost danger" data-action="delete">삭제</button>
      </div>`;
        item.querySelector('.comment__body').textContent = input.value.trim();
        list.prepend(item);
        input.value = '';
        submit.disabled = true;

        // 카운트 증가
        const c = $('#commentNum');
        c.dataset.count = String((Number(c.dataset.count)||0)+1);
        c.textContent = formatCount(c.dataset.count);
    });
}

/* 댓글 수정/삭제(모달 오픈) */
function bindCommentActions(){
    const list = $('.comments');
    const modal = $('#commentDeleteModal');
    let targetItem = null;

    list.addEventListener('click', (e)=>{
        const btn = e.target.closest('button[data-action]');
        if(!btn) return;
        const item = e.target.closest('.comment');

        if(btn.dataset.action==='edit'){
            const body = item.querySelector('.comment__body');
            const orig = body.textContent;
            const ta   = document.createElement('textarea');
            ta.value = orig;
            ta.className = 'comment-write__input';
            body.replaceWith(ta);
            btn.textContent = '저장';
            btn.dataset.action = 'save';
            return;
        }

        if(btn.dataset.action==='save'){
            const ta = item.querySelector('textarea');
            const div = document.createElement('div');
            div.className = 'comment__body';
            div.textContent = ta.value.trim();
            ta.replaceWith(div);
            btn.textContent = '수정';
            btn.dataset.action = 'edit';
            return;
        }

        if(btn.dataset.action==='delete'){
            targetItem = item;
            openModal(modal);
        }
    });

    $('#commentDeleteConfirm').addEventListener('click', ()=>{
        if(targetItem){
            targetItem.remove();
            // 카운트 감소
            const c = $('#commentNum');
            c.dataset.count = String(Math.max(0,(Number(c.dataset.count)||0)-1));
            c.textContent = formatCount(c.dataset.count);
        }
        closeModal(modal);
    });

    modal.addEventListener('click', (e)=>{
        if(e.target.matches('[data-close], .modal__backdrop')) closeModal(modal);
    });
}

/* 게시글 삭제 모달 */
function bindPostDelete(){
    const modal = $('#postDeleteModal');
    $('#deletePostBtn').addEventListener('click', ()=> openModal(modal));
    $('#postDeleteConfirm').addEventListener('click', ()=>{
        // 실제 삭제 API 연동 지점.
        // 성공 시 목록 페이지로 이동:
        // window.location.href = '/public/com/board_com.html';
        closeModal(modal);
        alert('삭제되었습니다.(더미)');
    });
    modal.addEventListener('click', (e)=>{
        if(e.target.matches('[data-close], .modal__backdrop')) closeModal(modal);
    });
}

/* 모달 공통 */
function openModal(modal){
    modal.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
}
function closeModal(modal){
    modal.classList.remove('is-open');
    document.documentElement.style.overflow = '';
}

/* 초기화 */
function init(){
    renderCounts();
    bindLike();
    bindCommentWrite();
    bindCommentActions();
    bindPostDelete();
}
init();
