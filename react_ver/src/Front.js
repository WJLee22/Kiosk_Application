import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Front = ({ voiceCommandResult }) => {
    const navigate = useNavigate();

    // 음성 명령에 따른 페이지 이동
    useEffect(() => {
        if (voiceCommandResult && voiceCommandResult.isUnderstood) {
            // 메뉴 화면으로 이동 명령 처리 예시
            if (voiceCommandResult.intent === '메뉴이동') {
                navigate('/menu');
            }
        }
    }, [voiceCommandResult, navigate]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "linear-gradient(135deg, #6e8efb, #a777e3)",
                color: "white",
            }}
        >
            <motion.h1
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            >
                어서오세요, Barion 키오스크입니다!
            </motion.h1>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    maxWidth: '600px',
                    textAlign: 'center'
                }}
            >
                <p>음성으로 주문하시려면 "Hey Barry-on"이라고 말한 후,</p>
                <p>원하시는 메뉴를 말씀해주세요.</p>
                <p>예: "아메리카노 한 잔 주문할게요"</p>
            </motion.div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/menu')}
                style={{
                    marginTop: '30px',
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#6e8efb',
                    border: 'none',
                    borderRadius: '30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                메뉴 보기
            </motion.button>
        </motion.div>
    );
};

export default Front;