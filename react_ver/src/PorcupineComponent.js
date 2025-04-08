import React, { useState, useEffect } from 'react';
import { usePorcupine } from '@picovoice/porcupine-react';

const PorcupineComponent = () => {
    const [isListening, setIsListening] = useState(false);
    const [detected, setDetected] = useState(false);

    // Porcupine 설정 객체 생성
    const porcupineKeyword = {
        publicPath: process.env.PUBLIC_URL + '/헤이--배리온_ko_wasm_v3_0_0.ppn', // public 폴더에 모델 파일을 넣어야 함
        label: '헤이  배리온' // 감지된 키워드를 식별하는 레이블
    };

    const porcupineModel = {
        publicPath: process.env.PUBLIC_URL + '/porcupine_params_ko.pv', // 한국어 모델 파일을 public 폴더에 넣어야 함
    };

    // Porcupine Hook 사용
    const {
        keywordDetection,
        isLoaded,
        isError,
        error,
        init,
        start,
        stop,
        release
    } = usePorcupine();

    // 초기화
    useEffect(() => {
        const initPorcupine = async () => {
            try {
                await init(
                    '키', // 실제 액세스 키로 변경 필요
                    porcupineKeyword,
                    porcupineModel
                );
                console.log('Porcupine 초기화 성공');
            } catch (e) {
                console.error('Porcupine 초기화 실패:', e);
            }
        };

        initPorcupine();

        // 컴포넌트 언마운트 시 리소스 해제
        return () => {
            if (isListening) {
                stop();
            }
            release();
        };
    }, []);

    // 음성 감지 시작/중지 관리
    useEffect(() => {
        const toggleListening = async () => {
            if (isLoaded && !isListening && !isError) {
                try {
                    await start();
                    setIsListening(true);
                    console.log('음성 감지 시작');
                } catch (e) {
                    console.error('음성 감지 시작 실패:', e);
                }
            }
        };

        toggleListening();
    }, [isLoaded, isError, isListening]);

    // 키워드 감지 처리
    useEffect(() => {
        if (keywordDetection !== null) {
            console.log(`Wake word '${keywordDetection.label}' 감지됨!`);
            setDetected(true);

            // 여기서 필요한 작업 수행 (예: 메뉴 페이지로 이동)
            // navigate('/menu');

            // 몇 초 후에 감지 상태 초기화
            setTimeout(() => setDetected(false), 3000);
        }
    }, [keywordDetection]);

    if (isError) {
        return <div>음성 인식 초기화 오류: {error}</div>;
    }

    if (!isLoaded) {
        return <div>음성 인식 모델 로딩중...</div>;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '15px',
            backgroundColor: detected ? 'green' : 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: '10px',
            transition: 'background-color 0.3s'
        }}>
            {detected ? '음성 명령 감지됨!' : '음성 대기 중...'}
        </div>
    );

};

export default PorcupineComponent; 