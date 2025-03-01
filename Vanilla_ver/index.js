

document.getElementById("start-button").addEventListener(`click`, () => {
    document.body.classList.add(`fade-out`);
    setTimeout(() => {
        window.location.href = `./page/orderPage.html`;
    }, 2000);
});

window.onload = function () {
    // 모든 리소스가 로드된 후에 요소들을 표시
    const welcomeAnimation = lottie.loadAnimation({
        container: document.getElementById('welcome'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './lottie/welcome.json',
    });

    const pumpkinAnimation = lottie.loadAnimation({
        container: document.getElementById('pumpkin'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './lottie/pumpkin.json',
    });

    // // Lottie 애니메이션이 로드된 후에 요소들을 표시
    // welcomeAnimation.addEventListener('DOMLoaded', () => {
    //     document.getElementById('welcome').classList.remove('hidden');
    // });

    // pumpkinAnimation.addEventListener('DOMLoaded', () => {
    //     document.getElementById('pumpkin').classList.remove('hidden');
    // });

    // 모든 애니메이션이 로드된 후에 버튼을 표시
    Promise.all([
        new Promise(resolve => welcomeAnimation.addEventListener('DOMLoaded', resolve)),
        new Promise(resolve => pumpkinAnimation.addEventListener('DOMLoaded', resolve)),
    ]).then(() => {
        document.getElementById('start-button').classList.remove('hidden');
    });
};