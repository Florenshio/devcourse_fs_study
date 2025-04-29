const express = require('express');
const app = express();
const PORT = 6666;
const conn = require('./mariadb');

app.use(express.json());

const userRouter = require('./router/users');

app.use('/users', userRouter);

async function initDatabase() {
  try {
    // users 테이블 생성 (없는 경우)
    await conn.promise().query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(50) NOT NULL,
        contact VARCHAR(50)
      )
    `);
    
    console.log('데이터베이스 테이블이 준비되었습니다.');
    
    // 테스트용 초기 데이터 추가 (테이블이 비어있을 경우에만)
    const [rows] = await conn.promise().query('SELECT COUNT(*) as count FROM users');
    
    if (rows[0].count === 0) {
      await conn.promise().query(
        'INSERT INTO Users (email, password, name, contact) VALUES (?, ?, ?, ?)',
        ['test@test.com', '1234', '테스트 사용자', '010-1234-5678']
      );
      console.log('테스트 사용자가 추가되었습니다.');
    }
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
  }
}

function start() {
    app.listen(PORT, () => {
        console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
        
        // 테이블 생성 확인 및 생성 (애플리케이션 시작 시 한 번만 실행)
        initDatabase();
    });
}

module.exports = {
    start
}