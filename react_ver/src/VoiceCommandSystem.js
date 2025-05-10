import React, { useState, useEffect, useRef } from 'react';
import { usePorcupine } from '@picovoice/porcupine-react';
import { useRhino } from '@picovoice/rhino-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCommandSystem = ({ onVoiceCommand }) => {
    // 기존 상태 및 설정 코드 유지...
    const [wakewordDetected, setWakewordDetected] = useState(false);
    const [isListeningCommands, setIsListeningCommands] = useState(false);
    const [lastDetection, setLastDetection] = useState(null);

    // 타이머 레퍼런스
    const commandTimeoutRef = useRef(null);
    const wakewordTimeoutRef = useRef(null);

    // 오디오 피드백용 레퍼런스
    const wakeAudioRef = useRef(null);
    const successAudioRef = useRef(null);

    // Porcupine 설정 객체 생성 (웨이크워드 감지)
    const porcupineKeyword = {
        publicPath: "/picovoice/porcupine/keywords/hey-barry-on_en_wasm_v3_0_0.ppn",
        label: 'Hey-Barry-on'
    };

    const porcupineModel = {
        publicPath: "/picovoice/porcupine/models/porcupine_params.pv",
    };

    // Rhino 설정 객체 생성 (음성 명령 인식)
    const rhinoContext = {
        publicPath: "/picovoice/rhino/contexts/rhino_ko_wasm_v3_0_0.rhn",
    };

    const rhinoModel = {
        publicPath: "/picovoice/rhino/models/rhino_params_ko.pv",
    };

    // Porcupine Hook 사용 (웨이크워드 감지)
    const {
        keywordDetection: wakewordDetection,
        isLoaded: wakewordLoaded,
        isListening: wakewordListening,
        isError: wakewordError,
        error: wakewordErrorMsg,
        init: initWakeword,
        start: startWakeword,
        stop: stopWakeword,
        release: releaseWakeword
    } = usePorcupine();

    // Rhino Hook 사용 (음성 명령 인식)
    const {
        inference: commandResult,
        isLoaded: commandLoaded,
        isListening: commandListening,
        isError: commandError,
        error: commandErrorMsg,
        init: initCommand,
        process: startCommandRecognition,
        release: releaseCommand
    } = useRhino();

    // 1. Porcupine 초기화 (웨이크워드 감지)
    useEffect(() => {
        console.log("웨이크워드 감지 시스템 초기화 중...");

        const initWakewordSystem = async () => {
            try {
                await initWakeword(
                    'pQu+pSBlNPKAILCoNxloMk0Tw8MW4Q5Kc0l+V1DdVhhRSTQxM9061w==', // 실제 AccessKey로 교체하세요
                    porcupineKeyword,
                    porcupineModel
                );
                console.log('웨이크워드 감지 초기화 성공');

                // 웨이크워드 감지 시작
                await startWakeword();
                console.log('웨이크워드 감지 시작됨');
            } catch (e) {
                console.error('웨이크워드 감지 초기화 실패:', e);
            }
        };

        initWakewordSystem();

        // 컴포넌트 언마운트 시 리소스 해제
        return () => {
            if (wakewordListening) {
                stopWakeword();
            }
            releaseWakeword();
            clearTimeouts();
        };
    }, []);

    // 2. Rhino 초기화 (음성 명령 인식)
    useEffect(() => {
        console.log("음성 명령 인식 시스템 초기화 중...");

        const initCommandSystem = async () => {
            try {
                await initCommand(
                    'pQu+pSBlNPKAILCoNxloMk0Tw8MW4Q5Kc0l+V1DdVhhRSTQxM9061w==', // 실제 AccessKey로 교체하세요
                    rhinoContext,
                    rhinoModel
                );
                console.log('음성 명령 인식 초기화 성공');
            } catch (e) {
                console.error('음성 명령 인식 초기화 실패:', e);
            }
        };

        initCommandSystem();

        // 컴포넌트 언마운트 시 리소스 해제
        return () => {
            releaseCommand();
        };
    }, []);

    // 3. 웨이크워드 감지 처리
    useEffect(() => {
        if (wakewordDetection !== null) {
            console.log(`웨이크워드 '${wakewordDetection.label}' 감지됨!`);
            setWakewordDetected(true);
            setLastDetection(new Date().toLocaleTimeString());

            // 오디오 피드백 재생 (있는 경우)
            if (wakeAudioRef.current) {
                wakeAudioRef.current.play().catch(e => console.error('오디오 재생 실패:', e));
            }

            // 이미 진행 중인 타이머가 있으면 취소
            clearTimeouts();

            // 음성 명령 인식 모드로 전환
            startCommandMode();

            // 10초 후 웨이크워드 감지 모드로 복귀
            wakewordTimeoutRef.current = setTimeout(() => {
                if (!isListeningCommands) { // 이미 명령 인식 중이 아니라면 (결과를 받지 못했다면)
                    resetToWakewordMode();
                }
            }, 10000); // 10초 타임아웃
        }
    }, [wakewordDetection]);

    // 4. 음성 명령 결과 처리
    useEffect(() => {
        if (commandResult !== null) {
            console.log('음성 명령 인식 결과:', commandResult);

            // 부모 컴포넌트로 결과 전달
            onVoiceCommand(commandResult);

            // 성공 오디오 피드백 (있는 경우)
            if (successAudioRef.current && commandResult.isUnderstood) {
                successAudioRef.current.play().catch(e => console.error('오디오 재생 실패:', e));
            }

            // 인식 완료 후 웨이크워드 감지 모드로 복귀
            setIsListeningCommands(false); // 여기서 listeningCommands를 false로 설정
            resetToWakewordMode();
        }
    }, [commandResult, onVoiceCommand]);

    // 5. 타임아웃 클리어 함수
    const clearTimeouts = () => {
        if (commandTimeoutRef.current) {
            clearTimeout(commandTimeoutRef.current);
            commandTimeoutRef.current = null;
        }

        if (wakewordTimeoutRef.current) {
            clearTimeout(wakewordTimeoutRef.current);
            wakewordTimeoutRef.current = null;
        }
    };

    // 6. 음성 명령 인식 모드 시작
    const startCommandMode = async () => {
        if (commandLoaded && !commandListening && !commandError) {
            try {
                // 웨이크워드 감지 일시 중지
                if (wakewordListening) {
                    await stopWakeword();
                }

                // 음성 명령 인식 시작
                setIsListeningCommands(true);
                await startCommandRecognition();
                console.log('음성 명령 인식 시작됨');

                // 명령 인식 타임아웃 (예: 7초 후 자동 종료)
                commandTimeoutRef.current = setTimeout(() => {
                    if (isListeningCommands) { // 여전히 명령을 듣고 있다면 (결과를 받지 못했다면)
                        console.log("명령 인식 시간 초과");
                        setIsListeningCommands(false);
                        resetToWakewordMode();
                    }
                }, 7000);


            } catch (e) {
                console.error('음성 명령 인식 시작 실패:', e);
                setIsListeningCommands(false); // 실패 시 상태 초기화
                resetToWakewordMode();
            }
        } else {
            console.warn('음성 명령 인식을 시작할 수 없음:', { loaded: commandLoaded, listening: commandListening, error: commandError });
            setIsListeningCommands(false); // 시작 불가 시 상태 초기화
            resetToWakewordMode();
        }
    };

    // 7. 웨이크워드 감지 모드로 복귀
    const resetToWakewordMode = async () => {
        setWakewordDetected(false);
        // setIsListeningCommands(false); // 이 줄은 이미 startCommandMode 실패 또는 commandResult 처리 시 호출됨

        // 타임아웃 클리어
        clearTimeouts();

        try {
            // 웨이크워드 감지 재시작
            if (!wakewordListening && wakewordLoaded) {
                await startWakeword();
                console.log('웨이크워드 감지 재시작됨');
            }
        } catch (e) {
            console.error('웨이크워드 감지 재시작 실패:', e);
        }
    };

    // 오류 상태일 때 최소한의 UI만 표시
    if (wakewordError || commandError) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '10px',
                left: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255,0,0,0.8)',
                color: 'white',
                borderRadius: '5px',
                fontSize: '14px',
                zIndex: 2000 // 다른 UI 요소들보다 위에 오도록
            }}>
                {wakewordError && <div>웨이크워드 오류: {wakewordErrorMsg?.message}</div>}
                {commandError && <div>음성 명령 오류: {commandErrorMsg?.message}</div>}
            </div>
        );
    }

    // 로딩 중일 때 최소한의 UI만 표시
    if (!wakewordLoaded || !commandLoaded) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '10px',
                left: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                borderRadius: '5px',
                fontSize: '14px',
                zIndex: 2000 // 다른 UI 요소들보다 위에 오도록
            }}>
                음성 인식 시스템 로딩 중...
            </div>
        );
    }

    // 메인 UI 렌더링
    return (
        <>
            {/* 오디오 피드백 */}
            <audio ref={wakeAudioRef} src="/sounds/wake.mp3" preload="auto" />
            <audio ref={successAudioRef} src="/sounds/success.mp3" preload="auto" />

            {/* 음성 인식 시각화 - AnimatePresence로 부드러운 표시/숨김 처리 */}
            <AnimatePresence>
                {isListeningCommands && (
                    <motion.div
                        className="voice-recognition-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* 상단 음성 시각화 인디케이터 */}
                        <motion.div className="voice-visualizer-container">
                            {/* 음성 파형 시각화 */}
                            <div className="voice-waveform">
                                {[...Array(30)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="waveform-bar"
                                        animate={{
                                            height: [
                                                `${15 + Math.random() * 35}px`,
                                                `${15 + Math.random() * 35}px`
                                            ]
                                        }}
                                        transition={{
                                            duration: 0.6 + Math.random() * 0.7,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* 움직이는 서브틀한 그라디언트 오버레이 */}
                        <div className="subtle-gradient-overlay" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 음성 인식 상태 표시 카드 */}
            <div className={`voice-status-card ${isListeningCommands ? 'listening' : wakewordDetected ? 'detected' : 'standby'}`}>
                {isListeningCommands ? (
                    <div className="card-content">
                        <div className="card-title">
                            명령을 말씀해주세요
                        </div>
                        <div className="card-subtitle">
                            음성 인식 중입니다
                        </div>
                    </div>
                ) : wakewordDetected ? (
                    <div className="card-content">웨이크워드 감지됨</div>
                ) : (
                    <div className="card-content">
                        <span className="wake-phrase">"Hey Barry-on"</span>
                        <span className="wake-hint">이라고 말해보세요</span>
                    </div>
                )}
            </div>

            {/* 스타일 정의 */}
            <style>
                {`
                /* 전체 화면 스타일 */
                body, html {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    height: 100%;
                    width: 100%;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                }
                
                #root {
                    height: 100%;
                    width: 100%;
                }

                /* 음성 인식 오버레이 */
                .voice-recognition-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 990;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                }
                
                /* 서브틀한 그라디언트 오버레이 - 고급스러운 분위기를 더함 */
                .subtle-gradient-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        radial-gradient(
                            ellipse at top center, 
                            rgba(84, 58, 183, 0.05) 0%, 
                            rgba(0, 0, 0, 0) 60%
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(32, 124, 229, 0.03) 0%,
                            rgba(32, 124, 229, 0) 100%
                        );
                    box-shadow: inset 0 0 100px rgba(0, 60, 255, 0.07);
                    z-index: -1;
                }

                /* 음성 시각화 컨테이너 */
                .voice-visualizer-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 70px;
                    background-color: rgba(0, 27, 64, 0.85);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    z-index: 992;
                }

                /* 음성 파형 시각화 */
                .voice-waveform {
                    display: flex;
                    align-items: center;
                    height: 40px;
                    gap: 2px;
                    padding: 0 20px;
                    width: 60%;
                    max-width: 800px;
                }

                .waveform-bar {
                    flex: 1;
                    background: linear-gradient(to top, rgba(32, 156, 255, 0.6), rgba(120, 217, 255, 0.9));
                    border-radius: 2px;
                    min-height: 3px;
                    box-shadow: 0 0 8px rgba(32, 156, 255, 0.6);
                }

                /* 음성 인식 상태 카드 */
                .voice-status-card {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    padding: 14px 20px;
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .voice-status-card.standby {
                    background-color: rgba(30, 30, 30, 0.8);
                }

                .voice-status-card.detected {
                    background-color: rgba(0, 112, 74, 0.85);
                }

                .voice-status-card.listening {
                    background-color: rgba(32, 124, 229, 0.85);
                    box-shadow: 0 4px 25px rgba(32, 124, 229, 0.4);
                }

                .card-content {
                    display: flex;
                    flex-direction: column;
                }

                .card-title {
                    font-weight: 600;
                    margin-bottom: 5px;
                }

                .card-subtitle {
                    font-size: 12px;
                    opacity: 0.9;
                }

                .wake-phrase {
                    font-weight: 500;
                }

                .wake-hint {
                    font-size: 12px;
                    margin-left: 5px;
                    opacity: 0.8;
                }
                `}
            </style>
        </>
    );
};

export default VoiceCommandSystem;