import React, { useState, useEffect, useRef } from 'react';
import { usePorcupine } from '@picovoice/porcupine-react';
import { useRhino } from '@picovoice/rhino-react';
import { motion, AnimatePresence } from 'framer-motion';


const VoiceCommandSystem = ({ onVoiceCommand }) => {
    // 기존 상태 및 설정 코드 유지...
    const [wakewordDetected, setWakewordDetected] = useState(false); // 내부 로직용 상태
    const [isListeningCommands, setIsListeningCommands] = useState(false);
    const [lastDetection, setLastDetection] = useState(null); // 내부 로직용 상태

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
        keywordDetection, // 로컬 상태 wakewordDetection과의 충돌을 피하기 위해 hook의 결과는 keywordDetection으로 받음
        isLoaded: wakewordLoaded,
        isListening: porcupineIsListening, // 로컬 상태 isListeningCommands와의 명확한 구분을 위해 변수명 변경
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
        isListening: rhinoIsListening, // 로컬 상태 isListeningCommands와의 명확한 구분을 위해 변수명 변경
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
            if (porcupineIsListening) {
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
        if (keywordDetection !== null) {
            console.log(`웨이크워드 '${keywordDetection.label}' 감지됨!`);
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
    }, [keywordDetection]); // keywordDetection 의존성 추가

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
        if (commandLoaded && !rhinoIsListening && !commandError) {
            try {
                // 웨이크워드 감지 일시 중지
                if (porcupineIsListening) {
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
            console.warn('음성 명령 인식을 시작할 수 없음:', { loaded: commandLoaded, listening: rhinoIsListening, error: commandError });
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
            if (!porcupineIsListening && wakewordLoaded) {
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

            {/* 음성 인식 시각화 */}
            <AnimatePresence>
                {isListeningCommands && (
                    <>
                        {/* 상단 중앙 리스닝 인디케이터 - 개선된 버전 */}
                        <motion.div
                            className="top-listening-indicator"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div className="sound-wave-icon">
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="listening-text">Listening...</span>
                        </motion.div>

                        {/* 화면 가장자리 펄스 효과 */}
                        <motion.div
                            className="pulsating-border-effect"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }} // 효과가 나타나고 사라지는 시간
                        />
                    </>
                )}
            </AnimatePresence>

            {/* 음성 인식 상태 표시 카드 - isListeningCommands 상태일 때만 표시 */}
            {isListeningCommands && (
                <motion.div
                    className="voice-status-card listening" // 항상 listening 클래스 적용
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="card-content">
                        <div className="card-title">
                            명령을 말씀해주세요
                        </div>
                        <div className="card-subtitle">
                            자연스럽게 말씀해 주세요
                        </div>
                    </div>
                </motion.div>
            )}

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

                /* 상단 중앙 리스닝 인디케이터 - 개선된 스타일 */
                .top-listening-indicator {
                    position: fixed;
                    top: 20px; /* 화면 상단과의 간격 */
                    left: 50%;
                    transform: translateX(-50%); /* 정확히 중앙 정렬 */
                    width: auto; /* 내용물에 맞게 너비 조정 */
                    display: flex;
                    align-items: center;
                    justify-content: center; /* 내부 요소들 중앙 정렬 */
                    padding: 8px 20px; /* 좌우 패딩 동일하게 */
                    background: rgba(0, 0, 0, 0.7); /* 검정색 배경으로 변경 */
                    border-radius: 24px; /* 더 둥글게 */
                    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.4); /* 그림자 색상도 검정색으로 변경 */
                    z-index: 1001;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.15); /* 테두리 조금 어둡게 */
                    backdrop-filter: blur(8px); /* 배경 블러 효과 */
                    -webkit-backdrop-filter: blur(8px);
                    text-align: center; /* 텍스트 중앙 정렬 */
                }

                .sound-wave-icon {
                    display: flex;
                    align-items: flex-end;
                    height: 16px;
                    margin-right: 12px; /* 간격 늘림 */
                }

                .sound-wave-icon span {
                    display: inline-block;
                    width: 3px;
                    margin: 0 1.5px;
                    background-color: white;
                    border-radius: 2px;
                    animation: sound-wave-animation 1.2s infinite ease-in-out;
                }

                .sound-wave-icon span:nth-child(1) {
                    height: 40%;
                    animation-delay: 0s;
                }
                .sound-wave-icon span:nth-child(2) {
                    height: 70%;
                    animation-delay: 0.2s;
                }
                .sound-wave-icon span:nth-child(3) {
                    height: 100%;
                    animation-delay: 0.4s;
                }
                .sound-wave-icon span:nth-child(4) {
                    height: 70%;
                    animation-delay: 0.6s;
                }
                .sound-wave-icon span:nth-child(5) {
                    height: 40%;
                    animation-delay: 0.8s;
                }

                @keyframes sound-wave-animation {
                    0%, 100% { transform: scaleY(0.3); }
                    50% { transform: scaleY(1); }
                }

                .listening-text {
                    font-size: 15px; /* 더 크게 */
                    font-weight: 500;
                    letter-spacing: 0.5px; /* 자간 추가 */
                    color: rgba(255, 255, 255, 1); /* 더 밝게 */
                }


                /* 화면 가장자리 펄스 효과 - 더 동적이고 빠르게 */
                .pulsating-border-effect {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none; /* 다른 요소 클릭 방해하지 않도록 */
                    z-index: 995; /* 다른 UI 요소들과의 관계 고려, 카드보다는 아래에 */
                    animation: pulse-glow-animation 1.8s infinite alternate ease-in-out; /* 더 빠른 애니메이션 */
                }

                @keyframes pulse-glow-animation {
                    0% {
                        box-shadow: 
                            inset 0 0 30px 15px rgba(0, 150, 255, 0.3), /* 안쪽 빛 */
                            0 0 30px 15px rgba(0, 150, 255, 0.3);  /* 바깥쪽 빛 */
                    }
                    50% { /* 중간 상태 추가로 더 부드럽고 동적인 효과 */
                        box-shadow: 
                            inset 0 0 50px 25px rgba(0, 160, 255, 0.55), /* 중간 단계 */
                            0 0 50px 25px rgba(0, 160, 255, 0.55);
                    }
                    100% {
                        box-shadow: 
                            inset 0 0 70px 35px rgba(0, 170, 255, 0.75), /* 더 넓고 진하게 */
                            0 0 70px 35px rgba(0, 170, 255, 0.75);
                    }
                }
                
                /* 음성 인식 상태 카드 스타일 */
                .voice-status-card { /* 공통 스타일 */
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    color: white;
                    font-size: 14px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    /* transition은 AnimatePresence의 motion 컴포넌트가 담당 */
                    z-index: 1000; /* 가장자리 효과보다 위에 있도록 */
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    min-width: 180px;
                }

                .voice-status-card.listening { /* 명령 인식 중일 때의 스타일 */
                    background: linear-gradient(135deg, rgba(0, 110, 255, 0.85), rgba(0, 150, 255, 0.85)); /* 상단 인디케이터와 일치 */
                    box-shadow: 0 4px 25px rgba(0, 136, 255, 0.35); 
                    border: 1px solid rgba(255, 255, 255, 0.2); /* 테두리 추가 */
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

                /* 더 이상 사용되지 않는 스타일 제거 */
                /* .voice-activity-bar, .activity-bar, .voice-status-text, .mic-icon-small 등 제거 */
                /* .corner-indicator 및 관련 @keyframes 제거 */
                /* .wake-phrase, .wake-hint 스타일 제거 */
                `}
            </style>
        </>
    );
};

export default VoiceCommandSystem;