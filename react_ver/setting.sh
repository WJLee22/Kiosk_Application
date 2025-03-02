# 설치 스크립트 시작
echo "Kiosk 환경 설정을 시작합니다..."

#1 Node.js & npm 설치 (버전 선택 가능)
NODE_VERSION=18
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

#2 프로젝트 디렉터리 생성: CRA(create-react-app) 설치
# <npx create-react-app react_ver>
# 현재는 깃허브에서 clone 받아서 사용하고 있으므로 생략. npm install만해서 필요한 종속 라이브러리들만 설치해주면 됨

#3 Electron 설치
#case 1: <npm install --save-dev electron>
# npm install --save-dev electron (현재 프로젝트에만 설치: --save-dev를 사용하는가? Electron은 주로 개발 환경에서 애플리케이션을 빌드하고 테스트하는 데 사용. 실제 배포된 애플리케이션에서는 Electron이 이미 패키징되어 있으므로, 별도로 설치할 필요가 없음. so, Electron을 devDependencies에 추가하여 개발 환경에서만 설치되도록 하는 것이 일반적)

#4 개발단계: dev모드로 Electron 실행
#(개발단계에서 편하게 사용가능: npm start 만 해줘도 개발중인 코드가 즉각 로드되어 electron이 실행됨)
# <npm start>

#5 배포단계: 각 os에 맞는 실행파일 생성
# 5-1: <npm run build>로 현재 리액트 프로젝트를 빌드.
# 5-2: <npm run dist>로 5-1에서 생성된 build 폴더를 기반으로 Electron 애플리케이션을 패키징하여 실행프로그램 생성.
# npm run build; npm run dist   <- 순차실행. 
# 추후 <npm run build:dist> 스크립트로 작성할 예정. "build:dist": "npm run build && npm run dist",
