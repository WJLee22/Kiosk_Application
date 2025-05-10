import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Front from './Front';
import Menu from './Menu';
import VoiceCommandSystem from './VoiceCommandSystem';

function App() {
  const [voiceCommandResult, setVoiceCommandResult] = useState(null);

  // 음성 명령 결과 처리 함수
  const handleVoiceCommand = (result) => {
    console.log("음성 명령 결과 수신:", result);
    setVoiceCommandResult(result);
  };

  return (
    <HashRouter>
      <div className="kiosk-app">
        {/* 음성 명령 시스템은 항상 활성화 */}
        <VoiceCommandSystem onVoiceCommand={handleVoiceCommand} />

        {/* 음성 명령 결과 표시 영역 (디버깅용) */}
        {voiceCommandResult && (
          <div className="voice-result-debug" style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px',
            fontSize: '14px'
          }}>
            <div><strong>인식된 명령:</strong></div>
            <pre style={{ margin: '5px 0', fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
              {JSON.stringify(voiceCommandResult, null, 2)}
            </pre>
          </div>
        )}

        {/* 키오스크 화면 라우팅 */}
        <Routes>
          <Route path="/" element={<Front voiceCommandResult={voiceCommandResult} />} />
          <Route path="/menu" element={<Menu voiceCommandResult={voiceCommandResult} />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;