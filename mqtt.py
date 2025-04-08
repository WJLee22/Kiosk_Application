# # 표준 MQTT 프로토콜 (1883 포트)
# listener 1883
# protocol mqtt

# # WebSocket 프로토콜 (9001 포트)
# listener 9001
# protocol websockets

# # 권한 설정
# allow_anonymous true

import paho.mqtt.client as mqtt
import time

# MQTT 클라이언트 설정
client = mqtt.Client()

# MQTT 브로커 연결 정보
broker_address = "localhost"
broker_port = 1883  # Python 스크립트는 일반 MQTT 포트 사용
topic = "detect"

def on_connect(client, userdata, flags, rc):
    """MQTT 브로커 연결 시 호출되는 콜백 함수"""
    connection_status = {
        0: "성공",
        1: "프로토콜 버전 거부",
        2: "잘못된 클라이언트 ID",
        3: "서버 사용 불가",
        4: "잘못된 사용자 이름 또는 비밀번호",
        5: "인증 실패"
    }
    print(f"MQTT 브로커 연결 상태: {connection_status.get(rc, f'알 수 없는 오류 {rc}')}")

def on_publish(client, userdata, mid):
    """메시지 발행 후 호출되는 콜백 함수"""
    print(f"메시지 ID {mid} 발행 완료")

# 콜백 함수 등록
client.on_connect = on_connect
client.on_publish = on_publish

# 브로커에 연결
try:
    print(f"MQTT 브로커({broker_address}:{broker_port})에 연결 중...")
    client.connect(broker_address, broker_port, 60)
    
    # 백그라운드 스레드로 네트워크 통신 처리
    client.loop_start()
    
    print("'q' 입력 시 프로그램 종료, 다른 입력 시 'detect' 토픽으로 메시지 발행")
    print("--------------------------------------------------------------")
    
    while True:
        # 사용자 입력 받기
        user_input = input("메시지를 입력하세요 (기본값: true): ")
        
        # 'q' 입력 시 종료
        if user_input.lower() == 'q':
            break
        
        # 입력이 없으면 'true' 기본값 사용
        message = user_input if user_input else "true"
        
        # 메시지 발행
        result = client.publish(topic, message)
        
        print(f"발행된 메시지: '{message}' (topic: {topic})")
        
        # 메시지 발행 후 상태 확인
        if result.rc != mqtt.MQTT_ERR_SUCCESS:
            print(f"메시지 발행 실패: {result}")
            
except KeyboardInterrupt:
    print("\n프로그램이 중단되었습니다.")
except Exception as e:
    print(f"오류 발생: {e}")
finally:
    # 연결 종료
    print("MQTT 연결 종료 중...")
    client.loop_stop()
    client.disconnect()
    print("프로그램 종료")