/* ===================================================
   board.js — 게시판 CRUD 로직
   Firebase Firestore 연동
=================================================== */

/* ── 상태 ── */
const PAGE_SIZE = 10;  // 한 페이지에 보여줄 글 수

let allPosts      = [];   // 불러온 전체 글 목록
let currentPage   = 1;    // 현재 페이지
let editingPostId = null; // 수정 중인 글 ID (null이면 새 글)

/* ── DOM 요소 ── */
const viewList   = document.getElementById('view-list');
const viewDetail = document.getElementById('view-detail');
const viewForm   = document.getElementById('view-form');

const postList    = document.getElementById('post-list');
const boardEmpty  = document.getElementById('board-empty');
const pagination  = document.getElementById('pagination');

const detailTitle  = document.getElementById('detail-title');
const detailAuthor = document.getElementById('detail-author');
const detailDate   = document.getElementById('detail-date');
const detailBody   = document.getElementById('detail-body');

const formTitleLabel = document.getElementById('form-title-label');
const inputTitle     = document.getElementById('input-title');
const inputAuthor    = document.getElementById('input-author');
const inputBody      = document.getElementById('input-body');

/* ── 뷰 전환 헬퍼 ── */
function showView(name) {
  viewList.classList.add('hidden');
  viewDetail.classList.add('hidden');
  viewForm.classList.add('hidden');
  document.getElementById('view-' + name).classList.remove('hidden');
}

/* ── 날짜 포맷 ── */
function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ── 토스트 알림 ── */
let toastTimer = null;
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = ''; }, 2800);
}

/* ── 로딩 표시 ── */
function showLoading() {
  postList.innerHTML = `
    <div class="board-loading">
      <div class="spinner"></div>
      <span>불러오는 중...</span>
    </div>`;
  boardEmpty.classList.add('hidden');
}

/* ===================================================
   Firestore CRUD
=================================================== */

/* 목록 불러오기 (실시간 리스너) */
function loadPosts() {
  showLoading();
  db.collection('posts')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      currentPage = 1;
      renderList();
    }, err => {
      console.error(err);
      showToast('글 목록을 불러오지 못했습니다.', 'error');
    });
}

/* 목록 렌더링 (페이지네이션 포함) */
function renderList() {
  const total     = allPosts.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const start     = (currentPage - 1) * PAGE_SIZE;
  const pagePosts = allPosts.slice(start, start + PAGE_SIZE);

  // 빈 상태
  if (total === 0) {
    postList.innerHTML = '';
    postList.appendChild(boardEmpty);
    boardEmpty.classList.remove('hidden');
    pagination.innerHTML = '';
    return;
  }

  boardEmpty.classList.add('hidden');
  postList.innerHTML = pagePosts.map((post, idx) => `
    <div class="post-item" data-id="${post.id}">
      <span class="post-item-num">${total - start - idx}</span>
      <div class="post-item-content">
        <div class="post-item-title">${escapeHtml(post.title)}</div>
        <div class="post-item-meta">
          <span>${escapeHtml(post.author || '익명')}</span>
          <span class="meta-sep">·</span>
          <span>${formatDate(post.createdAt)}</span>
        </div>
      </div>
      <span class="post-item-arrow">→</span>
    </div>
  `).join('');

  // 클릭 이벤트
  postList.querySelectorAll('.post-item').forEach(el => {
    el.addEventListener('click', () => openDetail(el.dataset.id));
  });

  // 페이지네이션
  pagination.innerHTML = '';
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = i;
      btn.addEventListener('click', () => { currentPage = i; renderList(); });
      pagination.appendChild(btn);
    }
  }
}

/* 글 상세 열기 */
function openDetail(postId) {
  const post = allPosts.find(p => p.id === postId);
  if (!post) return;

  detailTitle.textContent  = post.title;
  detailAuthor.textContent = post.author || '익명';
  detailDate.textContent   = formatDate(post.createdAt);
  detailBody.textContent   = post.body;

  // 수정/삭제 버튼에 ID 저장
  document.getElementById('btn-edit-post').dataset.id   = postId;
  document.getElementById('btn-delete-post').dataset.id = postId;

  showView('detail');
  window.scrollTo({ top: document.getElementById('board').offsetTop - 80, behavior: 'smooth' });
}

/* 글 쓰기 폼 열기 */
function openNewForm() {
  editingPostId = null;
  formTitleLabel.textContent    = '새 글 쓰기';
  document.getElementById('btn-submit-form').textContent = '등록';
  inputTitle.value  = '';
  inputAuthor.value = '';
  inputBody.value   = '';
  showView('form');
  window.scrollTo({ top: document.getElementById('board').offsetTop - 80, behavior: 'smooth' });
}

/* 글 수정 폼 열기 */
function openEditForm(postId) {
  const post = allPosts.find(p => p.id === postId);
  if (!post) return;

  editingPostId = postId;
  formTitleLabel.textContent    = '글 수정';
  document.getElementById('btn-submit-form').textContent = '수정 완료';
  inputTitle.value  = post.title;
  inputAuthor.value = post.author || '';
  inputBody.value   = post.body;
  showView('form');
  window.scrollTo({ top: document.getElementById('board').offsetTop - 80, behavior: 'smooth' });
}

/* 글 저장 (등록 or 수정) */
async function submitForm() {
  const title  = inputTitle.value.trim();
  const author = inputAuthor.value.trim() || '익명';
  const body   = inputBody.value.trim();

  if (!title) { showToast('제목을 입력해주세요.', 'error'); inputTitle.focus(); return; }
  if (!body)  { showToast('내용을 입력해주세요.', 'error'); inputBody.focus();  return; }

  const submitBtn = document.getElementById('btn-submit-form');
  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중...';

  try {
    if (editingPostId) {
      // 수정
      await db.collection('posts').doc(editingPostId).update({
        title,
        author,
        body,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast('글이 수정되었습니다.', 'success');
      // 수정 후 상세로 돌아가기
      editingPostId = null;
      showView('list');
    } else {
      // 등록
      await db.collection('posts').add({
        title,
        author,
        body,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast('글이 등록되었습니다.', 'success');
      showView('list');
    }
  } catch (err) {
    console.error(err);
    showToast('저장에 실패했습니다. 다시 시도해주세요.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingPostId ? '수정 완료' : '등록';
  }
}

/* 글 삭제 */
async function deletePost(postId) {
  const confirmed = window.confirm('정말 삭제하시겠습니까?');
  if (!confirmed) return;

  try {
    await db.collection('posts').doc(postId).delete();
    showToast('글이 삭제되었습니다.', 'success');
    showView('list');
  } catch (err) {
    console.error(err);
    showToast('삭제에 실패했습니다.', 'error');
  }
}

/* ── XSS 방지 ── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ===================================================
   이벤트 바인딩
=================================================== */
document.getElementById('btn-new-post').addEventListener('click', openNewForm);

document.getElementById('btn-back-list').addEventListener('click', () => showView('list'));
document.getElementById('btn-back-form').addEventListener('click', () => {
  if (editingPostId) {
    openDetail(editingPostId); // 수정 취소 → 상세로
  } else {
    showView('list');
  }
});
document.getElementById('btn-cancel-form').addEventListener('click', () => {
  if (editingPostId) {
    openDetail(editingPostId);
  } else {
    showView('list');
  }
});

document.getElementById('btn-edit-post').addEventListener('click', e => {
  openEditForm(e.currentTarget.dataset.id);
});
document.getElementById('btn-delete-post').addEventListener('click', e => {
  deletePost(e.currentTarget.dataset.id);
});

document.getElementById('btn-submit-form').addEventListener('click', submitForm);

/* ── 초기 로드 ── */
loadPosts();
