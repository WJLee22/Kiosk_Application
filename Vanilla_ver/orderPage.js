// order.js

// 주문 추가 함수
function addToOrder(menu, price) {
    alert(menu + '가(이) ₩' + price + '에 추가되었습니다.');
}

document.getElementById("pay-Button").addEventListener('click', () => {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = `./toss/checkout.html`;
    }, 2000);
});

// 챗봇 메시지 전송 함수
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');
    const message = chatInput.value;

    if (message.trim() === '') return;

    // 사용자 메시지 추가
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);

    // Flask 서버 호출
    try {
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error('API 호출 실패: ' + response.statusText);
        }


        const data = await response.json(); // JSON 형식으로 응답 파싱
        const botMessage = data.text; // JSON에서 텍스트 추출

        // 챗봇 응답 item 추가
        const botResponse = document.createElement('div');
        botResponse.className = 'chat-message bot-message';
        botResponse.textContent = botMessage;
        chatBody.appendChild(botResponse);
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'chat-message bot-message';
        errorMessage.textContent = '챗봇: 응답을 받는 중 오류가 발생했습니다.';
        chatBody.appendChild(errorMessage);
    }

    // 입력 필드 초기화
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
}

// 엔터 키로 메시지 전송
document.getElementById('chatInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});