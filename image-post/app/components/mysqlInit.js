// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Dockerを使わない場合はこのファイルを使う
// // テーブルの初期化を行う関数
// const mysqlInit = async (connection) => {

//   // const initSqlPath = '/init.sql';
//   const initSql = fs.readFileSync(initSqlPath, 'utf8');

//   try {
//     await new Promise((resolve, reject) => {
//       connection.query(initSql, (err, results) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         console.log('init.sql executed successfully.');
//         console.log('Results:', results);
//         resolve();
//       });
//     });
//   } catch (err) {
//     console.error('Error executing init.sql:', err);
//   }
// };

// export default mysqlInit;
