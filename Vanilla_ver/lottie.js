
lottie.loadAnimation({
    container: document.getElementById('pumpkin'), // 애니메이션을 표시할 컨테이너
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './lottie/pumpkin.json' // Lottie 애니메이션 JSON 파일 경로
});

lottie.loadAnimation({
    container: document.getElementById('welcome'), // 애니메이션을 표시할 컨테이너
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './lottie/welcome.json' // Lottie 애니메이션 JSON 파일 경로.
});

document.getElementById("start-button").addEventListener(`click`, () => {
    document.body.classList.add(`fade-out`);
    setTimeout(() => {
        window.location.href = `./orderPage.html`;
    }, 1000);
});