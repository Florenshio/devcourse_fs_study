// channel-api-test.js
const express = require('express');
const app = express();
const PORT = 7777;

// 미들웨어 설정
app.use(express.json());

// Map 객체를 사용한 DB 구현
const userDB = new Map(); // 사용자 저장소
let nextUserId = 1; // 사용자 ID 시퀀스

const channelDB = new Map(); // 채널 저장소
let nextChannelId = 1; // 채널 ID 시퀀스

// 사용자별 채널 관계 저장 (userId -> channelIds[])
const userChannelsDB = new Map();

// 테스트용 초기 데이터 추가
userDB.set(nextUserId, { 
  id: nextUserId, 
  userId: 'florenshio', 
  pwd: '1234', 
  name: '조영래' 
});
nextUserId++;

// 실제 서비스에서는 인증 미들웨어를 통해 로그인된 사용자 정보를 가져와야 함
// 여기서는 간단히 사용자 ID를 요청에서 가져오는 것으로 가정
// 실제 구현에서는 세션이나 토큰 기반 인증을 사용해야 함
const getCurrentUserId = (req) => {
  // 테스트를 위해 헤더에서 userId를 가져옴
  // 실제 구현에서는 인증 토큰에서 사용자 ID를 추출해야 함
  const userId = req.headers['user-id'];
  if (!userId) {
    return null;
  }
  
  // userId로 사용자 ID 찾기
  for (const [id, user] of userDB) {
    if (user.userId === userId) {
      return id;
    }
  }
  
  return null;
};

// 채널 생성 API - POST /channels
app.post('/channels', (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
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
    const userChannels = userChannelsDB.get(userId) || [];
    if (userChannels.length >= 100) {
      return res.status(400).json({
        success: false,
        message: '채널은 최대 100개까지만 생성할 수 있습니다'
      });
    }
    
    // 채널 정보 저장
    const channelId = nextChannelId++;
    const channel = {
      id: channelId,
      userId,
      channelTitle,
      createdAt: new Date()
    };
    
    channelDB.set(channelId, channel);
    
    // 사용자-채널 관계 업데이트
    userChannels.push(channelId);
    userChannelsDB.set(userId, userChannels);
    
    // 응답
    return res.status(201).json({
      success: true,
      message: `${channelTitle}님 채널을 응원합니다.`,
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
app.get('/channels', (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    // 사용자가 가진 채널 ID 목록
    const userChannels = userChannelsDB.get(userId) || [];
    
    // 채널 정보 조회
    const channels = userChannels.map(channelId => {
      const channel = channelDB.get(channelId);
      return {
        id: channel.id,
        channelTitle: channel.channelTitle,
        createdAt: channel.createdAt
      };
    });
    
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
app.get('/channels/:id', (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    const channelId = parseInt(req.params.id);
    
    // 채널 존재 여부 확인
    if (!channelDB.has(channelId)) {
      return res.status(404).json({
        success: false,
        message: '채널을 찾을 수 없습니다'
      });
    }
    
    const channel = channelDB.get(channelId);
    
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
app.put('/channels/:id', (req, res) => {
  try {
    const userId = getCurrentUserId(req);
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
    
    // 채널 존재 여부 확인
    if (!channelDB.has(channelId)) {
      return res.status(404).json({
        success: false,
        message: '채널을 찾을 수 없습니다'
      });
    }
    
    const channel = channelDB.get(channelId);
    
    // 채널 소유자 확인
    if (channel.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 채널을 수정할 권한이 없습니다'
      });
    }
    
    // 기존 채널 제목 저장
    const oldChannelTitle = channel.channelTitle;
    
    // 채널 정보 업데이트
    channel.channelTitle = channelTitle;
    channelDB.set(channelId, channel);
    
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
app.delete('/channels/:id', (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }
    
    const channelId = parseInt(req.params.id);
    
    // 채널 존재 여부 확인
    if (!channelDB.has(channelId)) {
      return res.status(404).json({
        success: false,
        message: '채널을 찾을 수 없습니다'
      });
    }
    
    const channel = channelDB.get(channelId);
    
    // 채널 소유자 확인
    if (channel.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 채널을 삭제할 권한이 없습니다'
      });
    }
    
    // 채널 삭제
    channelDB.delete(channelId);
    
    // 사용자-채널 관계 업데이트
    const userChannels = userChannelsDB.get(userId) || [];
    const updatedUserChannels = userChannels.filter(id => id !== channelId);
    userChannelsDB.set(userId, updatedUserChannels);
    
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
});
