const Edit = () => {
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('edit-btn').addEventListener('click', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const profile = document.getElementById('profile').value;
    const date_of_birth = document.getElementById('date_of_birth').value;

    const response = await fetch('/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, profile, date_of_birth }),
    });

    const result = await response.json();
    // console.log('Result:', result);

    if (response.ok) {
      if (result.success) {
        alert('ユーザー情報が更新されました。');
        window.location.href = '/dashboard';
      } else {
        alert('編集に失敗しました。');
      }
    } else {
      alert(result.message);
    }
  });

  // キャンセルボタンを押したときの処理
  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.location.href = '../dashboard';
  });
    
  // ユーザー情報を取得してフォームに入力しておく処理
  const fetchUserData = async() => {
    try {
      const response = await fetch('/some-route');

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();

      // フォーム要素に取得したデータを設定
      document.getElementById('name').value = data.name;
      document.getElementById('profile').value = data.profile;
      document.getElementById('date_of_birth').value = data.date_of_birth;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // 処理を実行
  fetchUserData();
});
};

export default Edit;