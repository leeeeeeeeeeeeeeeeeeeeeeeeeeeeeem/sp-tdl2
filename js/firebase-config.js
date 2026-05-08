/* ===================================================
   firebase-config.js — Firebase 설정 파일

   ⚠️  아래 firebaseConfig 값을 본인 Firebase 프로젝트 것으로 교체하세요!
   설정 방법은 README.md 를 참고하세요.
=================================================== */

const firebaseConfig = {
  apiKey:            "여기에-본인-apiKey-붙여넣기",
  authDomain:        "여기에-본인-authDomain-붙여넣기",
  projectId:         "여기에-본인-projectId-붙여넣기",
  storageBucket:     "여기에-본인-storageBucket-붙여넣기",
  messagingSenderId: "여기에-본인-messagingSenderId-붙여넣기",
  appId:             "여기에-본인-appId-붙여넣기"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
