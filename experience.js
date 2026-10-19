// Thử tự phát ngay khi vào web; nếu bị chặn, thử lại từ thao tác người dùng.
const audio = new Audio('./audio/music.mp3');
audio.loop = true;
audio.autoplay = true;
audio.volume = 0.7;
audio.preload = 'auto';
window.musicManager = {
    audio,
    start() {
        if (!audio.paused) return;
        const attempt = audio.play();
        if (attempt) attempt.catch(() => {});
    }
};
function unlockMusic() { window.musicManager.start(); }
document.addEventListener('pointerdown', unlockMusic);
document.addEventListener('pointerup', unlockMusic);
document.addEventListener('keydown', unlockMusic);
window.musicManager.start();
const letterDialog = document.getElementById('letter-dialog');
window.openLetter = () => { if (!letterDialog.open) letterDialog.showModal(); };
document.getElementById('close-letter').addEventListener('click', () => letterDialog.close());
letterDialog.addEventListener('click', event => {
    const box = letterDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) letterDialog.close();
});
