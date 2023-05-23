import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const users = (app, connectionExecute) => {

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);


  // ログイン処理
  app.post('/login', async (req, res) => {
    const { name, password } = req.body;
  
    // 入力の検証を行う
    if (!name || !password) {
        return res.status(400).json({ success: false, message: '入力が不足しています。' });
    }

    try {
      const result = await connectionExecute('SELECT * FROM user WHERE name = ?', [name]);
      const user = result[0];

      if (user) {
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            // ユーザー情報をセッションに保存
            req.session.user = {
                id: user.id,
                name: user.name,
            };

            // ログイン状態をセッションに保存
            req.session.loggedIn = true;

            return res.json({ success: true });
          }
      }

      return res.status(401).json({ success: false, message: 'ユーザー名またはパスワードが間違っています。' });
    } catch (error) {
      console.log('Error during login:', error);
      console.error(error);
      return res.status(500).json({ success: false, message: 'サーバーエラーが発生しました。' });
    }
  });

  app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
    } else {
        res.redirect('/');
    }
  });

  // サインアップ処理
  app.post('/signup', async (req, res) => {
    const { name, profile, date_of_birth, password } = req.body;

    if (!name || !profile || !date_of_birth || !password) {
      return res.status(400).json({ success: false, message: '入力が不足しています。' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connectionExecute('INSERT INTO user (name, profile, date_of_birth, password) VALUES (?, ?, ?, ?)', [name, profile, date_of_birth, hashedPassword]);
      return res.json({ success: true });
    } catch (error) {
      console.log('Error during signup:', error);
      console.error(error);

      // デュプリケートエントリエラーを判断する
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'この名前はすでに使用されています。別の名前を選んでください。' });
      } else {
        return res.status(500).json({ success: false, message: 'サーバーエラーが発生しました。' });
      }
    }
  });

  // セッションを削除してログアウト
  app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ success: false, message: 'ログアウトに失敗しました。' });
      }

      // セッションを削除し、ログイン画面にリダイレクト
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });

  // ユーザー情報の編集処理
  app.put('/edit', async (req, res) => {
    const { name, profile, date_of_birth } = req.body;
    const userId = req.session.user.id;

    if (!name || !profile || !date_of_birth) {
      return res.status(400).json({ success: false, message: '入力が不足しています。' });
    }

    try {
      const updateResult = await connectionExecute('UPDATE user SET name = ?, profile = ?, date_of_birth = ? WHERE id = ?', [name, profile, date_of_birth, userId]);
      return res.json({ success: true });
    } catch (error) {
      console.log('Error during edit:', error);
      console.error(error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'この名前はすでに使用されています。別の名前を選んでください。' });
      } else {
        return res.status(500).json({ success: false, message: 'サーバーエラーが発生しました。' });
      }
    }
  });

  // 編集画面で変更前のユーザー情報を入力しておく
  app.get('/some-route', async (req, res) => {
    // セッションからユーザー情報を取得
    const user = req.session.user;
  
    if (!user) {
      // ユーザー情報が存在しない場合、エラーレスポンスを返す
      return res.status(401).json({ success: false, message: 'ログインが必要です。' });
    }
  
    // ユーザーIDを取得
    const userId = user.id;
  
    try {
      // ユーザー情報をデータベースから取得
      const rows = await connectionExecute('SELECT * FROM user WHERE id = ?', [userId]);
  
      if (rows && rows.length > 0) {
        const userData = rows[0];
        const dateOfBirth = new Date(userData.date_of_birth);
        const formattedDateOfBirth = `${dateOfBirth.getFullYear()}-${(dateOfBirth.getMonth() + 1).toString().padStart(2, '0')}-${dateOfBirth.getDate().toString().padStart(2, '0')}`;
        return res.json({
          success: true,
          userId: userData.id,
          name: userData.name,
          profile: userData.profile,
          date_of_birth: formattedDateOfBirth,
        });
      } else {
        return res.status(404).json({ success: false, message: 'ユーザーが見つかりません。' });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ success: false, message: 'サーバーエラーが発生しました。' });
    }
  });
};

export default users;