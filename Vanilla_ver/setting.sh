# 설치 스크립트 시작
echo "Kiosk 환경 설정을 시작합니다..."

# Node.js & npm 설치 (버전 선택 가능)
NODE_VERSION=18
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

# # Electron 설치
#case 1: npm install --save-dev electron
# npm install --save-dev electron (현재 프로젝트에만 설치: --save-dev를 사용하는가? Electron은 주로 개발 환경에서 애플리케이션을 빌드하고 테스트하는 데 사용. 실제 배포된 애플리케이션에서는 Electron이 이미 패키징되어 있으므로, 별도로 설치할 필요가 없음. so, Electron을 devDependencies에 추가하여 개발 환경에서만 설치되도록 하는 것이 일반적)

#case 2: sudo npm install -g electron
# sudo npm install -g electron  (시스템 전체에서 사용 가능한 경로에 설치)

22:17