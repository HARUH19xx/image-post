import './styles.scss';
document.getElementById('login-btn').addEventListener('click', async () => {
  const name = document.getElementById('name').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
    });

    if (response.status === 401) {
        alert('ユーザー名またはパスワードが間違っています。');
        return;
    }

    if (!response.ok) {
        throw new Error('サーバーエラーが発生しました。');
    }

    const result = await response.json();
    if (result.success) {
        window.location.href = '/dashboard';
    } else {
        alert('ログインに失敗しました。');
    }
  } catch (error) {
    console.error(error);
    alert('サーバーエラーが発生しました。');
  }
});