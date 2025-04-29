/* mariaDB 적용 및 라우터 적용 진행중... */
const express = require('express');
const conn = require('../mariadb');
const app = express();
const PORT = 7777;

app.use(express.json());

const getCurrentUserId = async (req) => {
  try {
    const email = req.headers['user-email'];
    if (!email) {
      return null;
    }

    const [users] = await conn.promise().query(
      'SELECT id FROM Users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0].email;
  } catch (error) {
    console.error('사용자 ID 조회 오류:', error);
    return null;
  }
};

// 채널 생성 API - POST /channels
app.post('/channels', async (req, res) => {
  try {
    const email = await getCurrentUserId(req);
    if (!email) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    const { channelTitle } = req.body;
    
    // 필수 필드 검증
    if (!channelTitle) {
      return res.status(400).json({
        success: false,
        message: '채널 제목을 입력해주세요'
      });
    }
    
    // 사용자가 가진 채널 수 확인 (최대 100개)
    // 변경: Map 객체 대신 데이터베이스 쿼리 사용
    const [channels] = await conn.promise().query(
      'SELECT COUNT(*) as count FROM Channels WHERE userId = ?',
      [email]
    );
    
    if (channels[0].count >= 100) {
      return res.status(400).json({
        success: false,
        message: '채널은 최대 100개까지만 생성할 수 있습니다'
      });
    }
    
    // 채널 정보 저장 - MariaDB 사용
    // 변경: Map.set() 대신 SQL INSERT 쿼리 사용
    const [result] = await conn.promise().query(
      'INSERT INTO Channels (userId, channelTitle, createdAt) VALUES (?, ?, NOW())',
      [email, channelTitle]
    );
    
    // 응답
    return res.status(201).json({
      success: true,
      message: `${channelTitle} 채널을 응원합니다.`,
      redirectTo: '/channels'
    });
  } catch (error) {
    console.error('채널 생성 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 회원 한명이 가진 전체 채널 조회 API - GET /channels
app.get('/channels', async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    // 사용자가 가진 채널 조회 - MariaDB 사용
    // 변경: Map 객체 대신 데이터베이스 쿼리 사용
    const [channels] = await conn.promise().query(
      'SELECT id, channelTitle, createdAt FROM Channels WHERE userId = ?',
      [userId]
    );
    
    return res.status(200).json({
      success: true,
      data: channels
    });
  } catch (error) {
    console.error('채널 목록 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 채널 개별 조회 API - GET /channels/:id
app.get('/channels/:id', async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    const channelId = parseInt(req.params.id);
    
    // 채널 조회 - MariaDB 사용
    // 변경: Map.has() 및 Map.get() 대신 SQL 쿼리 사용
    const [channels] = await conn.promise().query(
      'SELECT * FROM Channels WHERE id = ?',
      [channelId]
    );
    
    if (channels.length === 0) {
      return res.status(404).json({
        success: false,
        message: '채널을 찾을 수 없습니다'
      });
    }
    
    const channel = channels[0];
    
    // 채널 소유자 확인
    if (channel.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 채널에 접근할 권한이 없습니다'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        id: channel.id,
        channelTitle: channel.channelTitle,
        createdAt: channel.createdAt
      }
    });
  } catch (error) {
    console.error('채널 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 채널 개별 수정 API - PUT /channels/:id
app.put('/channels/:id', async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    const channelId = parseInt(req.params.id);
    const { channelTitle } = req.body;
    
    // 필수 필드 검증
    if (!channelTitle) {
      return res.status(400).json({
        success: false,
        message: '채널 제목을 입력해주세요'
      });
    }
    
    // 채널 조회 - MariaDB 사용
    // 변경: Map.has() 및 Map.get() 대신 SQL 쿼리 사용
    const [channels] = await conn.promise().query(
      'SELECT * FROM Channels WHERE id = ?',
      [channelId]
    );
    
    if (channels.length === 0) {
      return res.status(404).json({
        success: false,
        message: '채널을 찾을 수 없습니다'
      });
    }
    
    const channel = channels[0];
    
    // 채널 소유자 확인
    if (channel.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 채널을 수정할 권한이 없습니다'
      });
    }
    
    // 기존 채널 제목 저장
    const oldChannelTitle = channel.channelTitle;
    
    // 채널 정보 업데이트 - MariaDB 사용
    // 변경: Map.set() 대신 SQL UPDATE 쿼리 사용
    await conn.promise().query(
      'UPDATE Channels SET channelTitle = ? WHERE id = ?',
      [channelTitle, channelId]
    );
    
    return res.status(200).json({
      success: true,
      message: `채널 명이 성공적으로 수정되었습니다. 기존: ${oldChannelTitle} -> 수정: ${channelTitle}`
    });
  } catch (error) {
    console.error('채널 수정 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 채널 개별 삭제 API - DELETE /channels/:id
app.delete('/channels/:id', async (req, res) => {
  try {
    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    const channelId = parseInt(req.params.id);
    
    // 채널 조회 - MariaDB 사용
    // 변경: Map.has() 및 Map.get() 대신 SQL 쿼리 사용
    const [channels] = await conn.promise().query(
      'SELECT * FROM Channels WHERE id = ?',
      [channelId]
    );
    
    if (channels.length === 0) {
      return res.status(404).json({
        success: false,
        message: '채널을 찾을 수 없습니다'
      });
    }
    
    const channel = channels[0];
    
    // 채널 소유자 확인
    if (channel.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 채널을 삭제할 권한이 없습니다'
      });
    }
    
    // 채널 삭제 - MariaDB 사용
    // 변경: Map.delete() 대신 SQL DELETE 쿼리 사용
    await conn.promise().query(
      'DELETE FROM Channels WHERE id = ?',
      [channelId]
    );
    
    return res.status(200).json({
      success: true,
      message: '삭제 되었습니다.',
      redirectTo: '/main'
    });
  } catch (error) {
    console.error('채널 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`채널 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  
  // 테이블 생성 확인 및 생성 (애플리케이션 시작 시 한 번만 실행)
  initDatabase();
});

// 데이터베이스 초기화 함수 - MariaDB 사용
// 변경: 테이블이 없을 경우 생성
async function initDatabase() {
  try {
    // Channels 테이블 생성 (없는 경우)
    await conn.promise().query(`
      CREATE TABLE IF NOT EXISTS Channels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        channelTitle VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('채널 데이터베이스 테이블이 준비되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
  }
}
