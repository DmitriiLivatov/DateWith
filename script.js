const TELEGRAM_BOT_TOKEN = '8131140460:AAGpIRs_74_3RrmI9rVEqJhhHnDfOswuanU';
const TELEGRAM_CHAT_ID = '1948777578';

// Переменная, чтобы сердце не создавалось дубликатами
let heartAnimation = null;

document.addEventListener('DOMContentLoaded', () => {
    // Основные иконки шагов
    const icons = ['date', 'time', 'place'];
    icons.forEach(name => {
        const container = document.getElementById(`lottie-${name}-icon`);
        if (container) {
            lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: `${name}.json` // Убедитесь, что файлы лежат в той же папке
            });
        }
    });

    // Настройка календаря
    flatpickr("#date", { 
        locale: "ru", 
        dateFormat: "d.m.Y", 
        minDate: "today", 
        disableMobile: true 
    });

    // Настройка времени
    flatpickr("#time", { 
        enableTime: true, 
        noCalendar: true, 
        dateFormat: "H:i", 
        time_24hr: true, 
        locale: "ru", 
        disableMobile: true 
    });
});

function openEnvelope() {
    const env = document.getElementById('envelope');
    const seal = document.getElementById('wax-seal');
    
    if (!env.classList.contains('open')) {
        env.classList.add('open');
        
        if (seal) seal.style.opacity = '0';
        
        // Загружаем сердце только один раз при открытии
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
}

function nextStep(step) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const nextScreen = document.getElementById(`step-${step}`);
    if (nextScreen) nextScreen.classList.add('active');

    // Если это финальный экран — запускаем успех
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

function moveNoInsideLetter() {
    const btn = document.getElementById('no-btn');
    const area = document.querySelector('.letter-inner');
    
    if (!btn || !area) return;

    btn.style.position = 'absolute';
    // Ограничиваем область, чтобы кнопка не вылетала за края белого листа
    const maxX = area.clientWidth - btn.offsetWidth;
    const maxY = area.clientHeight - btn.offsetHeight;
    
    const randomX = Math.max(0, Math.floor(Math.random() * maxX));
    const randomY = Math.max(0, Math.floor(Math.random() * maxY));

    btn.style.left = randomX + 'px';
    btn.style.top = randomY + 'px';
}

function sendToTelegram() {
    const btn = document.getElementById('final-send-btn');
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const place = document.getElementById('place').value;
    const wish = document.getElementById('wish').value;

    // Простая проверка на заполнение
    if (!date || !time) {
        alert("Пожалуйста, выбери дату и время!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Отправка...";

    const text = `❤️ Ответ!\n📅 Дата: ${date}\n⏰ Время: ${time}\n📍 Место: ${place || 'Не указано'}\n💭 Пожелания: ${wish || 'Нет'}`;

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text })
    })
    .then(response => {
        if (response.ok) {
            // Красивая анимация улетающего конверта перед финалом
            const envelope = document.getElementById('step-1');
            if (envelope) envelope.style.transform = 'translateY(-1000px)';
            
            setTimeout(() => nextStep(5), 600);
        } else {
            throw new Error('Ошибка сети');
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.innerText = "Ошибка. Попробовать еще раз";
        console.error(err);
    });
}