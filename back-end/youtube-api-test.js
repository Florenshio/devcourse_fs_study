// app.js
const express = require('express');
const app = express();
const PORT = 6666;

// 미들웨어 설정
app.use(express.json());

// Map 객체를 사용한 DB 구현
const userDB = new Map(); // 사용자 저장소
let nextUserId = 1; // 사용자 ID 시퀀스

// 회원 가입 API - POST /join
app.post('/join', (req, res) => {
  try {
    const { userId, pwd, name } = req.body;
    
    // 필수 필드 검증
    if (!userId || !pwd || !name) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요'
      });
    }
    
    // userId 중복 검증
    for (const [_, user] of userDB) {
      if (user.userId === userId) {
        return res.status(409).json({
          success: false,
          message: '이미 존재하는 사용자 ID입니다'
        });
      }
    }
    
    // 회원 정보 저장
    const id = nextUserId++;
    userDB.set(id, { id, userId, pwd, name });
    
    // 응답
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
app.post('/login', (req, res) => {
  try {
    const { userId, pwd } = req.body;
    
    // 필수 필드 검증
    if (!userId || !pwd) {
      return res.status(400).json({
        success: false,
        message: '아이디와 비밀번호를 모두 입력해주세요'
      });
    }
    
    // 사용자 조회
    let user = null;
    for (const [_, userData] of userDB) {
      if (userData.userId === userId) {
        user = userData;
        break;
      }
    }
    
    // 사용자 없음 또는 비밀번호 불일치
    if (!user || user.pwd !== pwd) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 일치하지 않습니다'
      });
    }
    
    // 로그인 성공
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
app.get('/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!userDB.has(id)) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    const user = userDB.get(id);
    
    // 사용자 정보 반환 (비밀번호 제외)
    return res.status(200).json({
      success: true,
      data: {
        userId: user.userId,
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
app.delete('/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!userDB.has(id)) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }
    
    const user = userDB.get(id);
    
    // 사용자 삭제
    userDB.delete(id);
    
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

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 테스트용 초기 데이터 추가
userDB.set(nextUserId, { 
  id: nextUserId, 
  userId: 'test', 
  pwd: 'test123', 
  name: '테스트 사용자' 
});
nextUserId++;