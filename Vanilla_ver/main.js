
const { app, BrowserWindow } = require('electron'); // electron 모듈을 불러옴
// app 객체는 애플리케이션의 수명 주기를 관리(앱 시작 및 종료, 브라우저 창 생성 등 애플리케이션의 수명 주기를 제어)
// BrowserWindow 객체는 브라우저 창을 생성

// {/*-----!!!-----*/ }
// {/*라즈베리파이 및 rubik pi와 같은 저사양 데스크톱에서의 성능 최적화 환경설정 2가지*/ }
// app.disableHardwareAcceleration(); // GPU 가속 비활성화: 라즈베리파이의 GPU 성능이 낮아, GPU가속시 성능이 저하될 수 있음. Chromium의 GPU 가속 기능을 완전히 끕니다. 이는 GPU를 사용하지 않고 CPU로 모든 렌더링 작업을 처리하도록 지시.
// app.commandLine.appendSwitch('disable-software-rasterizer'); // 소프트웨어 래스터라이저 비활성. 소프트웨어 래스터라이저는 GPU를 사용할 수 없는 경우에 CPU로 그래픽을 렌더링하는 방법. 라즈베리파이와 같은 저사양 하드웨어에서는 GPU 가속을 비활성화하고, 소프트웨어 래스터라이저도 비활성화하여 CPU 부하를 줄이는 것이 좋음
// {/*----------*/ }

let mainWindow = null; // 애플리케이션의 메인 창을 저장하기 위해 선언. 이 변수는 나중에 브라우저 창 객체를 참조


// 애플리케이션이 준비되면 브라우저 창을 생성
// app 객체에 ready 이벤트 리스너를 추가. ready 이벤트는 애플리케이션이 메모리에 로드되면 발생
app.on('ready',
  () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      // webPreferences: {
      //   hardwareAcceleration: true // GPU 가속 활성화
      // }
    });   // 브라우저 창 객체를 생성하고 mainWindow 변수에 저장. fullscreen: true로 설정하면 전체 화면으로 표시
    mainWindow.loadURL(`file://${__dirname}/index.html`); // 브라우저 창에 표시할 HTML 파일을 지정. __dirname은 현재 실행 중인 스크립트가 있는 디렉터리를 나타냄. index.html 파일을 불러옴

    mainWindow.on('closed', () => { mainWindow = null; }); // 브라우저 창이 닫히면 mainWindow 변수를 null로 설정. 이렇게 하면 메모리 누수를 방지할 수 있음
  });

// 맥 OS에서는 애플리케이션을 종료해도 메뉴바에는 남아있음. so, darwin 플랫폼에서는 애플리케이션을 종료하지 않도록 설정
// 맥 OS에서는 메뉴바에서 명령을 실행하거나 Cmd+Q 키를 눌러야 애플리케이션이 종료됨
// .on 이란, 이벤트 리스너를 추가하는 메소드. 즉, app 객체에 window-all-closed 이벤트 리스너를 추가. 'window-all-closed' 이벤트리스너는 모든 창이 닫히면 발생 -> 콜백으로 app.quit() 실행.  app.quit()은 애플리케이션을 종료하는 메서드.
app.on('window-all-closed',
  () => {
    if (process.platform !== 'darwin')
      app.quit();
  });