document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('signup-btn').addEventListener('click', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const profile = document.getElementById('profile').value;
    const date_of_birth = document.getElementById('date_of_birth').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, profile, date_of_birth, password }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.success) {
        window.location.href = '/';
        alert('サインアップに成功しました。');
      } else {
        alert('サインアップに失敗しました。');
      }
    } else {
      // サーバーからのエラーメッセージを表示
      alert(result.message);
    }
  });
});