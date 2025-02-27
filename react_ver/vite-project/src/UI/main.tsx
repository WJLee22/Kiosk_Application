import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

//npm run build 후, npm run dev:electron 하기. dist-react 폴더에 있는 index.html 파일이 electron에 로드되야 화면에 나타남
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
