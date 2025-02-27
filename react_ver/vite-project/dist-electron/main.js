import { app, BrowserWindow } from 'electron';
import path from 'path'; // node.js의 내장 모듈로, 파일 및 디렉토리 경로를 처리하는 데 사용. loadFile 사용시 여러 os간의 경로 차이를 해결하기 위해 사용
let mainWindow = null; // 애플리케이션의 메인 창을 저장하기 위해 선언. 이 변수는 나중에 브라우저 창 객체를 참조
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
    });
    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html')); // react 앱의 index.html 파일을 불러옴
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
