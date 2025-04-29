const express = require('express');
const router = express.Router();
const conn = require('../mariadb');

// 회원 가입 API - POST /join
router.post('/join', async (req, res) => {
  try {
    const { email, password, name, contact } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요'
      });
    }
    
    const [existingUsers] = await conn.promise().query(
      'SELECT * FROM Users WHERE email = ?', 
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: '이미 존재하는 사용자 ID입니다'
      });
    }
    
    const [result] = await conn.promise().query(
      'INSERT INTO Users (email, password, name, contact) VALUES (?, ?, ?, ?)',
      [email, password, name, contact]
    );
    
    return res.status(201).json({
      success: true,
      message: `${name}님 환영합니다.`,
      redirectTo: '/login'
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 로그인 API - POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '아이디와 비밀번호를 모두 입력해주세요'
      });
    }
    
    const [users] = await conn.promise().query(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0 || users[0].password !== password) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 일치하지 않습니다'
      });
    }
    
    const user = users[0];
    
    return res.status(200).json({
      success: true,
      message: `${user.name}님 환영합니다.`,
      redirectTo: '/main'
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 사용자 정보 조회 API - GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [users] = await conn.promise().query(
      'SELECT * FROM Users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    const user = users[0];
    
    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 회원 탈퇴 API - DELETE /users/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [users] = await conn.promise().query(
      'SELECT * FROM Users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    const user = users[0];

    await conn.promise().query(
      'DELETE FROM Users WHERE id = ?',
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: `${user.name}님 다음에 또 뵙겠습니다.`,
      redirectTo: '/main'
    });
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router;
