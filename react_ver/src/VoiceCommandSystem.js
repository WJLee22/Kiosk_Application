import React, { useState, useEffect, useRef } from 'react';
import { usePorcupine } from '@picovoice/porcupine-react';
import { useRhino } from '@picovoice/rhino-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCommandSystem = ({ onVoiceCommand }) => {
    // 상태 관리
    const [wakewordDetected, setWakewordDetected] = useState(false);
    const [isListeningCommands, setIsListeningCommands] = useState(false);
    const [lastDetection, setLastDetection] = useState(null);

    // 타이머 레퍼런스
    const commandTimeoutRef = useRef(null);
    const wakewordTimeoutRef = useRef(null);

    // 오디오 피드백용 레퍼런스 (선택적)
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
                    '키', // 실제 AccessKey로 교체하세요
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
                if (!isListeningCommands) {
                    resetToWakewordMode();
                }
            }, 10000);
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
            setIsListeningCommands(false);
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
            } catch (e) {
                console.error('음성 명령 인식 시작 실패:', e);
                resetToWakewordMode();
            }
        } else {
            console.warn('음성 명령 인식을 시작할 수 없음:', { loaded: commandLoaded, listening: commandListening, error: commandError });
            resetToWakewordMode();
        }
    };

    // 7. 웨이크워드 감지 모드로 복귀
    const resetToWakewordMode = async () => {
        setWakewordDetected(false);
        setIsListeningCommands(false);

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
                zIndex: 1000
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
                zIndex: 1000
            }}>
                음성 인식 시스템 로딩 중...
            </div>
        );
    }

    // 메인 UI 렌더링
    return (
        <>
            {/* 오디오 피드백 (선택적) */}
            <audio ref={wakeAudioRef} src="/sounds/wake.mp3" preload="auto" />
            <audio ref={successAudioRef} src="/sounds/success.mp3" preload="auto" />

            {/* 네온 테두리 효과: 음성 인식 중일 때만 표시 */}
            <AnimatePresence>
                {isListeningCommands && (
                    <motion.div
                        className="neon-border-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="neon-border-glow" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 음성 인식 상태 표시 */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                padding: '12px 15px',
                backgroundColor: wakewordDetected ? 'rgba(0,128,0,0.8)' : 'rgba(0,0,0,0.6)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                transition: 'background-color 0.3s',
                zIndex: 1000 // 네온 테두리보다 아래에 있도록 zIndex 조정
            }}>
                {wakewordDetected ? (
                    isListeningCommands ? (
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                명령을 말씀해주세요...
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                웨이크워드 감지: {lastDetection}
                            </div>
                        </div>
                    ) : (
                        <div>웨이크워드 감지됨!</div>
                    )
                ) : (
                    <div>
                        <span>"Hey Barry-on"</span>
                        <span style={{ fontSize: '12px', marginLeft: '5px', opacity: 0.8 }}>
                            이라고 말해보세요
                        </span>
                    </div>
                )}
            </div>

            {/* CSS 애니메이션 */}
            <style>
                {`
                /* 전체 화면 스크롤 방지 및 기본 스타일 */
                body, html {
                    margin: 0;
                    padding: 0;
                    overflow: hidden; /* 스크롤바 제거 */
                    height: 100%;
                    width: 100%;
                }
                #root { /* React 앱의 루트 요소 */
                    height: 100%;
                    width: 100%;
                }

                .neon-border-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none; /* 테두리가 다른 요소 클릭을 막지 않도록 */
                    z-index: 999; /* 다른 UI 요소 위에 표시되도록 */
                    overflow: hidden; /* 내부 glow가 넘치지 않도록 */
                }

                .neon-border-glow {
                    position: absolute;
                    top: 5px; /* 테두리 두께만큼 안쪽으로 */
                    left: 5px;
                    right: 5px;
                    bottom: 5px;
                    border-radius: 15px; /* 화면 모서리 둥글게 */
                    border: 3px solid transparent; /* 초기 테두리는 투명 */
                    box-shadow:
                        /* Outer glow */
                        0 0 10px 2px rgba(0, 255, 128, 0.7), /* 연한 초록 */
                        0 0 20px 5px rgba(0, 255, 128, 0.5),
                        0 0 30px 8px rgba(0, 255, 128, 0.3),
                        /* Inner glow (optional) */
                        inset 0 0 10px 2px rgba(0, 255, 128, 0.5);
                    animation: neon-pulse 1.5s infinite alternate;
                }

                @keyframes neon-pulse {
                    0% {
                        box-shadow:
                            0 0 10px 2px rgba(0, 255, 128, 0.7),
                            0 0 20px 5px rgba(0, 255, 128, 0.5),
                            0 0 30px 8px rgba(0, 255, 128, 0.3),
                            inset 0 0 10px 2px rgba(0, 255, 128, 0.5);
                        border-color: rgba(0, 255, 128, 0.7);
                    }
                    100% {
                        box-shadow:
                            0 0 20px 5px rgba(50, 255, 150, 0.9), /* 더 밝은 초록 */
                            0 0 40px 10px rgba(50, 255, 150, 0.7),
                            0 0 60px 15px rgba(50, 255, 150, 0.5),
                            inset 0 0 15px 3px rgba(50, 255, 150, 0.7);
                        border-color: rgba(50, 255, 150, 0.9);
                    }
                }
                `}
            </style>
        </>
    );
};

export default VoiceCommandSystem;