const { app, BrowserWindow } = require("electron");
const path = require('path');


// 라즈베리파이 및 rubik pi와 같은 저사양 데스크톱에서의 성능 최적화 환경설정
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-software-rasterizer');


async function createWindow() {
    const isDev = (await import('electron-is-dev')).default;

    let mainWindow = new BrowserWindow({
        width: 1200,
        height: 1200,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
        },
    });

    mainWindow.loadURL(
        //개발 모드일 때는 localhost:3000에서 로드하고, 배포 모드일 때는 빌드된 HTML 파일을 로드.
        //즉, npm start로 실행할 때는 localhost:3000에서 로드하고, npm run build로 빌드한 후에는 빌드된 HTML 파일을 로드
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});