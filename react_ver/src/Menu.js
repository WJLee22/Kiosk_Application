import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Menu = ({ voiceCommandResult }) => {
    const navigate = useNavigate();

    // 음성 명령에 따른 동작
    useEffect(() => {
        if (voiceCommandResult && voiceCommandResult.isUnderstood) {
            // 홈으로 이동 명령 처리 예시
            if (voiceCommandResult.intent === '홈이동') {
                navigate('/');
            }

            // 주문 처리 예시
            if (voiceCommandResult.intent === '커피주문') {
                const coffee = voiceCommandResult.slots?.커피 || '';
                const quantity = voiceCommandResult.slots?.수량 || '';

                console.log(`주문 접수: ${coffee} ${quantity}잔`);
                // 여기에 주문 처리 로직 추가
            }
        }
    }, [voiceCommandResult, navigate]);

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.5 }}
            style={{
                minHeight: "100vh",
                padding: "30px",
                background: "#f5f5f7",
            }}
        >
            <h1>메뉴 화면</h1>

            <div style={{ marginBottom: '20px' }}>
                <p>
                    "Hey Barry-on"이라고 말한 후, 원하시는 메뉴를 주문해보세요.
                </p>
                <p>
                    예: "아메리카노 두 잔 주문할게요"
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '30px'
            }}>
                {/* 메뉴 아이템 예시 */}
                {['아메리카노', '카페라떼', '카푸치노', '에스프레소'].map((item, index) => (
                    <div key={index} style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        textAlign: 'center'
                    }}>
                        <h3>{item}</h3>
                        <p>￦ {(index + 3) * 1000}</p>
                    </div>
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                style={{
                    marginTop: '30px',
                    padding: '12px 24px',
                    backgroundColor: '#6e8efb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                처음으로 돌아가기
            </motion.button>
        </motion.div>
    );
};

export default Menu;