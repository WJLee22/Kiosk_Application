import mqtt from "mqtt";
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PorcupineComponent from './PorcupineComponent';

// 시작 화면 컴포넌트
const Front = () => {
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
    </motion.div>
  );
};

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
    </motion.div>
  );
};

// MQTT 연결 및 라우팅을 관리하는 컴포넌트
const MqttHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    // WebSocket을 사용하여 MQTT 브로커에 연결
    const client = mqtt.connect("ws://localhost:9001");

    client.on("connect", () => {
      console.log("✅ WebSocket MQTT 연결됨!");
      client.subscribe("detect"); // 휠체어 감지 토픽 구독
    });

    client.on("message", (topic, payload) => {
      const msg = payload.toString();
      console.log(`📢 수신된 메시지: ${msg}`);
      setMessage(msg);

      if (msg === "true") {
        // 현재 경로에 따라 다른 페이지로 이동
        if (location.pathname === '/menu') {
          console.log("휠체어 감지! Front 화면으로 이동합니다.");
          navigate('/');
        } else {
          console.log("휠체어 감지! Menu 화면으로 이동합니다.");
          navigate('/menu');
        }
      }
    });

    client.on("error", (err) => {
      console.error("MQTT 오류:", err);
    });

    return () => {
      console.log("MQTT 연결 종료");
      client.end();
    };
  }, [navigate, location.pathname]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        padding: "10px",
        background: "rgba(0,0,0,0.5)",
        color: "white",
        borderRadius: "5px"
      }}
    >
      MQTT 상태: {message ? `메시지 수신됨: ${message}` : "메시지 없음"}
    </div>
  );
};

// 라우트를 애니메이션과 함께 렌더링하는 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Front />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </AnimatePresence>
  );
};

// 메인 앱 컴포넌트
const App = () => {
  return (
    <HashRouter>
      <div className="App">
        <AnimatedRoutes />
        <MqttHandler />
        <PorcupineComponent /> {/* 음성 인식 컴포넌트 추가 */}
      </div>
    </HashRouter>
  );
};

export default App;