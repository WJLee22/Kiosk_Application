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

#5 dist_배포단계: 각 os에 맞는 실행파일 생성
# 5-1: <npm run build>로 현재 리액트 프로젝트를 빌드.
# 5-2: <npm run dist>로 5-1에서 생성된 build 폴더를 기반으로 Electron 애플리케이션을 패키징하여 실행프로그램 생성.
# npm run build; npm run dist   <- 순차실행. 
# 추후 <npm run build:dist> 스크립트로 작성할 예정. "build:dist": "npm run build && npm run dist",


# ✅📌📌✅
#6 deploy_실 배포단계(setup.exe): 설치파일을 통한 실제 데스크탑 앱 배포시 주의점⚠
# 만약 실제 데스크탑 앱 배포 후 사용자가 프로그램 설치를 돕는 setup파일을 이용하게된다면, 아래의 주의사항을 반드시 확인해야함.
# 일렉트론 메인 프로세스 모듈인 electron.js에서, 현재 실행 모드가 개발모드인지 파악하는 모듈인 electron is dev를 동기적으로 가져오는 코드부분인 <const isDev = (await import('electron-is-dev')).default;> 해당 구문을 제거해줘야한다.
# (import는 node module에서 설치해둔 모듈을 가져오는 구문인데, setup파일 실행을 통해 설치된 데스크탑 앱 디렉터리에는 node module이 없기 때문에, await으로 인해 동기적으로 계속 기다리게되어 앱 윈도우가 생성되지않아 화면에 앱이 보이지않게된다. 
# 그러므로 실 배포단계에서는 해당 구문을 제거해주어야함을 꼭 인지하자.)  

# 1.
# const isDev = (await import('electron-is-dev')).default; 구문 제거.
# 2.
# isDev ? 'http://localhost:3000': `file://${path.join(__dirname, '../build/index.html')}` ▶ `file://${path.join(__dirname, '../build/index.html')}`  로 변경

# 만약 현재 개발단계라면, 위 #6 주의사항을 무시하고 개발을 진행하면 된다. 

# setup파일 실행을통해 생성된 실행프로그램과는 달리, npm run dist를 통해 생성된 dist디렉터리 내의 .exe 실행프로그램의 경우엔, 상위 디렉터리에 node_modules가 존재하기 때문에, 해당 구문을 제거하지 않아도 정상적으로 실행된다. 