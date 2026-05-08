let posts = [];

function render() {
  const list = document.getElementById("postList");
  list.innerHTML = "";

  posts.forEach((p, i) => {
    list.innerHTML += `
      <div class="card" style="padding:20px; margin-bottom:15px;">
        <h3 style="margin-bottom:10px;">${p.title}</h3>
        <p style="margin-bottom:15px;">${p.content}</p>
        <button class="btn btn-outline" onclick="editPost(${i})">수정</button>
        <button class="btn btn-primary" onclick="deletePost(${i})">삭제</button>
      </div>
    `;
  });
}

function addPost() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!title || !content) return alert("입력하세요");

  posts.push({ title, content });
  render();

  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
}

function deletePost(i) {
  posts.splice(i, 1);
  render();
}

function editPost(i) {
  const newTitle = prompt("새 제목", posts[i].title);
  const newContent = prompt("새 내용", posts[i].content);

  if (newTitle && newContent) {
    posts[i] = { title: newTitle, content: newContent };
    render();
  }
}
