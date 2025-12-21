/**
 * Telegram Bot Configuration
 */
const TELEGRAM_BOT_TOKEN = '8131140460:AAGpIRs_74_3RrmI9rVEqJhhHnDfOswuanU';
const TELEGRAM_CHAT_ID = '1948777578';

let heartAnimation = null;
let yesBtnScale = 1;

document.addEventListener('DOMContentLoaded', () => {
    initLottieIcons();
    initPickers();
    initNoButton();
});

/* =========================
   INIT
========================= */

function initLottieIcons() {
    ['date', 'time', 'place'].forEach(name => {
        const el = document.getElementById(`lottie-${name}-icon`);
        if (!el) return;

        lottie.loadAnimation({
            container: el,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: `${name}.json`
        });
    });
}

function initPickers() {
    flatpickr("#date", {
        locale: "ru",
        dateFormat: "d.m.Y",
        minDate: "today",
        disableMobile: true
    });

    flatpickr("#time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        locale: "ru",
        disableMobile: true
    });
}

/* =========================
   NO BUTTON (FIXED)
========================= */

function initNoButton() {
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.querySelector('.btn-yes');
    const area = document.querySelector('.letter-inner');

    if (!noBtn || !area || !yesBtn) return;

    const moveNo = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const maxX = area.clientWidth - noBtn.offsetWidth;
        const maxY = area.clientHeight - noBtn.offsetHeight;

        noBtn.style.position = 'absolute';
        noBtn.style.left = Math.random() * maxX + 'px';
        noBtn.style.top = Math.random() * maxY + 'px';

        yesBtnScale += 0.15;
        yesBtn.style.transform = `scale(${yesBtnScale})`;
    };

    // 📱 телефоны
    noBtn.addEventListener('touchstart', moveNo, { passive: false });

    // 🖥 ПК
    noBtn.addEventListener('mouseover', moveNo);

    // 🔒 защита от клика
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
}

/* =========================
   ENVELOPE
========================= */

function openEnvelope() {
    const env = document.getElementById('envelope');
    const seal = document.getElementById('wax-seal');

    if (env.classList.contains('open')) return;

    env.classList.add('open');
    if (seal) seal.style.opacity = '0';

    if (!heartAnimation) {
        heartAnimation = lottie.loadAnimation({
            container: document.getElementById('lottie-heart-inner'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'heart.json'
        });
    }
}

/* =========================
   STEPS
========================= */

function nextStep(step) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`step-${step}`)?.classList.add('active');

    const progress = document.getElementById('progress-fill');
    if (progress) progress.style.width = `${(step / 5) * 100}%`;

    if (step === 2 || step === 5) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4d6d', '#ff758f', '#ffffff']
        });
    }

    if (step === 5) {
        lottie.loadAnimation({
            container: document.getElementById('lottie-success'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'success.json'
        });
    }
}

/* =========================
   TELEGRAM
========================= */

function sendToTelegram() {
    const btn = document.getElementById('final-send-btn');

    const date = dateInput();
    const time = timeInput();
    const place = value('place');
    const wish = value('wish');

    if (!date || !time) {
        alert("Выбери дату и время 💖");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Отправляю...";

    const text =
        `💌 ПРИГЛАШЕНИЕ\n\n` +
        `📅 ${date}\n` +
        `⏰ ${time}\n` +
        `📍 ${place || 'Сюрприз'}\n` +
        `💭 ${wish || 'Без пожеланий'}`;

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text
        })
    })
    .then(r => r.ok ? nextStep(5) : Promise.reject())
    .catch(() => {
        btn.disabled = false;
        btn.innerText = "Ошибка 😢";
    });
}

/* =========================
   HELPERS
========================= */

const value = id => document.getElementById(id)?.value || '';
const dateInput = () => value('date');
const timeInput = () => value('time');
