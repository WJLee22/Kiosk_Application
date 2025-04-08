// 메뉴 화면 컴포넌트
const Menu = () => {
    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.5 }}
            style={{
                height: "100vh",
                padding: "20px",
                background: "#f5f5f7",
            }}
        >
            <h1>메뉴 화면</h1>
            <p>휠체어가 감지되어 메뉴 화면으로 이동했습니다.</p>
            <p>다시 "헤이 배리온"을 말하거나 휠체어 감지 신호를 보내면 시작 화면으로 돌아갑니다.</p>
        </motion.div>
    );
};