document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    const isLoggedIn = async() => {
      // サーバーにログイン状態を問い合わせるためのリクエストを送信
      const response = await fetch('/check-login', {
          method: 'GET',
          headers: {
          'Content-Type': 'application/json',
          },
      });
  
      // レスポンスを解析してログイン状態を取得
      const data = await response.json();
  
      return data.loggedIn;
    }
    
    const checkToLoggedIn = async() => {
        const loggedIn = await isLoggedIn();
    
        if (!loggedIn) {
            window.location.href = '/login';
        }
    };

    await checkToLoggedIn();

    const response = await fetch('/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      alert('ログアウトに失敗しました。');
    }
  });

  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    window.location.href = '../edit.html';
  });

  //　画像をアップロードする処理
  document.getElementById('image-upload').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const response = await fetch('/upload-image', {
        method: 'POST',
        body: formData,
    });
    const result = await response.json();
    console.log(result)

    if (response.ok) {
        if (result.success) {
        console.log('画像アップロード成功:', result.imageUrl);
        alert(result.message);
        // 画像のURLをデータベースに保存する処理を実行
        } else {
        console.error('画像アップロード失敗:', result.message);
        }
    } else {
        console.error('サーバーエラー:', result.message);
    }
  });
});