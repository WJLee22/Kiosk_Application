// MQTT 클라이언트 변수
let client = null;
let connectionFlag = false;

// 페이지 로딩 후 MQTT 연결 시작
window.addEventListener('load', function () {
    // 1초 후 연결 (React 앱이 로드될 시간 확보)
    setTimeout(startConnect, 1000);
});

// MQTT 브로커에 연결
function startConnect() {
    console.log("MQTT 연결 시도...");

    // 브로커 접속 정보
    let broker = "localhost";
    let port = 9001; // WebSocket 포트
    let clientId = "barion_kiosk_" + Math.random().toString(16).substr(2, 8);

    try {
        // MQTT 클라이언트 객체 생성
        client = new Paho.MQTT.Client(broker, Number(port), clientId);

        // 콜백 함수 설정
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        // 브로커에 접속
        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure,
            keepAliveInterval: 30
        });
    } catch (e) {
        console.error("MQTT 클라이언트 생성 오류:", e);
    }
}

// 연결 성공 콜백
function onConnect() {
    console.log("MQTT 브로커에 연결되었습니다.");
    connectionFlag = true;

    // detect 토픽 구독
    subscribe("detect");
}

// 연결 실패 콜백
function onFailure(error) {
    console.error("MQTT 연결 실패:", error.errorMessage);
    connectionFlag = false;

    // 3초 후 재연결 시도
    setTimeout(startConnect, 3000);
}

// 연결 종료 콜백
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.error("MQTT 연결 끊김:", responseObject.errorMessage);
    }
    connectionFlag = false;

    // 연결 끊김 시 3초 후 재연결 시도
    setTimeout(startConnect, 3000);
}

// 메시지 수신 콜백
function onMessageArrived(message) {
    console.log("수신 메시지:", message.payloadString);

    // detect 토픽에서 'true' 메시지를 받으면 메뉴 화면으로 이동
    if (message.destinationName === "detect" && message.payloadString === "true") {
        console.log("휠체어 감지! 메뉴 화면으로 이동합니다.");
        // 해시 라우터 URL 변경
        window.location.hash = "/menu";
    }
}

// 토픽 구독 함수
function subscribe(topic) {
    if (!connectionFlag) return false;

    try {
        client.subscribe(topic);
        console.log(`${topic} 토픽 구독 시작`);
        return true;
    } catch (e) {
        console.error(`${topic} 토픽 구독 실패:`, e);
        return false;
    }
}

// 메시지 발행 함수
function publish(topic, message) {
    if (!connectionFlag) return false;

    try {
        let mqttMessage = new Paho.MQTT.Message(message);
        mqttMessage.destinationName = topic;
        client.send(mqttMessage);
        console.log(`메시지 발행: ${topic} - ${message}`);
        return true;
    } catch (e) {
        console.error(`메시지 발행 실패: ${topic}`, e);
        return false;
    }
}

// 연결 종료 함수
function disconnect() {
    if (!connectionFlag) return;

    client.disconnect();
    connectionFlag = false;
    console.log("MQTT 연결 종료");
}

// 전역 객체에 MQTT 함수 노출 (React에서 접근 가능하도록)
window.mqttClient = {
    subscribe,
    publish,
    disconnect,
    isConnected: () => connectionFlag
};