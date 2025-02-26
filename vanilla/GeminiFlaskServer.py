from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app)  # CORS 허용. 

# Gemini API 엔드포인트
load_dotenv()  # .env 파일에서 환경 변수 로드

API_KEY = os.getenv('GEMINI_API_KEY')  # .env 파일에서 Gemini API 키 가져오기

client = genai.Client(api_key=API_KEY)

# Flask 라우트 설정. /chat 경로로 들어오는 POST 요청을 처리할 chat() 함수 정의
@app.route('/chat', methods=['POST'])
# chat() 함수 정의. 클라이언트로부터 메시지를 받아 Gemini API에 요청을 보내고, 응답을 클라이언트에 반환
def chat():
    try:
        # 클라이언트로부터 메시지 받기.
        data = request.json
        message = data.get('message')

        # Gemini API로 요청 보내기
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[message]
        )
        
        # Gemini API 응답 반환
        return jsonify({
            "text": response.text,
            "status": "success"
        })


    except Exception as e:
        print(f"Error: {e}")  # 오류 메시지 출력
        return jsonify({"error": str(e)}), 500

# Flask 서버 실행. 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)