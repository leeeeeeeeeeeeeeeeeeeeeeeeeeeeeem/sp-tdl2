/* ===================================================
   main.js — 개인 홈페이지 인터랙션
=================================================== */

/* ── 1. 햄버거 메뉴 ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// 모바일 메뉴 링크 클릭 시 닫기
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ── 2. 헤더 스크롤 그림자 ── */
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
  } else {
    header.style.boxShadow = 'none';
  }
});

/* ── 3. 스크롤 등장 애니메이션 ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

// .reveal 클래스가 붙은 요소에 순서대로 딜레이 적용
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.08 + 's';
  observer.observe(el);
});
