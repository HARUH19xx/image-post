import users from './components/users.js';
import uploader from './components/uploader.js';
import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import util from 'util';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// import mysqlInit from './components/mysqlInit.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './.env' });

//DBとsession

//Dockerを使う場合、ポート番号に注意！
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// セッションストアとセッションの設定
const MySQLStore = new MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  expiration: (1000 * 60 * 60 * 24), // 1日
}, connection);

app.use(session({
  key: 're',
  secret: 'dropofgoldensun',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1日
  }
}));

//DBに接続
connection.connect(async (err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return
  };
  console.log('connection success!');

  // Docker使用時には、これは使わない
  // try {
  //   await mysqlInit(connection);
  // } catch (error) {
  //   console.error('Error initializing database:', error);
  // }
});

// ミドルウェアの設定
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/assets/uploads', express.static('uploads'));

// ログイン状態をチェックするAPIエンドポイント
app.get('/check-login', (req, res) => {
  if (req.session.loggedIn) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
})

const connectionExecute = util.promisify(connection.execute).bind(connection);

users(app, connectionExecute);
uploader(app, connectionExecute);

const port = process.env.PORT || 3000;
app.listen(port);
console.log('Listen on port: ' + port);