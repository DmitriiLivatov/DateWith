const TELEGRAM_BOT_TOKEN = '8131140460:AAGpIRs_74_3RrmI9rVEqJhhHnDfOswuanU';
const TELEGRAM_CHAT_ID = '1948777578';

let heartAnimation = null;
let yesBtnScale = 1; // Для роста кнопки Да

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Lottie
    ['date', 'time', 'place'].forEach(name => {
        const container = document.getElementById(`lottie-${name}-icon`);
        if (container) {
            lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: `${name}.json`
            });
        }
    });

    // Pickers
    flatpickr("#date", { locale: "ru", dateFormat: "d.m.Y", minDate: "today", disableMobile: true });
    flatpickr("#time", { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true, locale: "ru", disableMobile: true });
});

function openEnvelope() {
    const env = document.getElementById('envelope');
    const seal = document.getElementById('wax-seal');
    if (!env.classList.contains('open')) {
        env.classList.add('open');
        if (seal) seal.style.opacity = '0';
        if (!heartAnimation) {
            heartAnimation = lottie.loadAnimation({
                container: document.getElementById('lottie-heart-inner'),
                renderer: 'svg', loop: true, autoplay: true, path: 'heart.json'
            });
        }
    }
}

function nextStep(step) {
    // 1. Переключаем экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const nextScreen = document.getElementById(`step-${step}`);
    if (nextScreen) nextScreen.classList.add('active');

    // 2. Обновляем прогресс-бар (всего 5 шагов)
    const progress = (step / 5) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;

    // 3. Эффекты
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
            renderer: 'svg', loop: true, autoplay: true, path: 'success.json'
        });
    }
}

function moveNoInsideLetter() {
    const btnNo = document.getElementById('no-btn');
    const btnYes = document.querySelector('.btn-yes');
    const area = document.querySelector('.letter-inner');
    
    if (!btnNo || !area) return;

    // Убегающая кнопка
    btnNo.style.position = 'absolute';
    const maxX = area.clientWidth - btnNo.offsetWidth;
    const maxY = area.clientHeight - btnNo.offsetHeight;
    btnNo.style.left = Math.random() * maxX + 'px';
    btnNo.style.top = Math.random() * maxY + 'px';

    // Рост кнопки "Да"
    yesBtnScale += 0.15;
    btnYes.style.transform = `scale(${yesBtnScale})`;
}

function sendToTelegram() {
    const btn = document.getElementById('final-send-btn');
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const place = document.getElementById('place').value;
    const wish = document.getElementById('wish').value;

    if (!date || !time) {
        alert("Пожалуйста, выбери дату и время!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Отправка...";

    const text = `🎉 НОВЫЙ ОТВЕТ!\n\n📅 Дата: ${date}\n⏰ Время: ${time}\n📍 Место: ${place || 'На твой вкус'}\n💭 Пожелания: ${wish || 'Нет'}`;

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text })
    })
    .then(res => {
        if (res.ok) {
            nextStep(5);
        } else {
            throw new Error();
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.innerText = "Ошибка. Еще раз?";
    });
}