// Configuration for Telegram Bot API integration
const TELEGRAM_BOT_TOKEN = '8131140460:AAGpIRs_74_3RrmI9rVEqJhhHnDfOswuanU';
const TELEGRAM_CHAT_ID = '1948777578';

// Global variable to store the Lottie heart instance to prevent duplicate renders
let heartAnimation = null;

/**
 * Initialization on page load.
 * Loads primary Lottie icons for each step and configures the Flatpickr date/time inputs.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Iterate through step icons and initialize Lottie animations from local JSON files
    const icons = ['date', 'time', 'place'];
    icons.forEach(name => {
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

    // Initialize the date picker with Russian locale and mobile optimization disabled
    flatpickr("#date", { 
        locale: "ru", 
        dateFormat: "d.m.Y", 
        minDate: "today", 
        disableMobile: true 
    });

    // Initialize the time picker (24h format) with mobile optimization disabled
    flatpickr("#time", { 
        enableTime: true, 
        noCalendar: true, 
        dateFormat: "H:i", 
        time_24hr: true, 
        locale: "ru", 
        disableMobile: true 
    });
});

/**
 * Handles the envelope opening interaction.
 * Triggers CSS transitions and initializes the heart animation inside the letter.
 */
function openEnvelope() {
    const env = document.getElementById('envelope');
    const seal = document.getElementById('wax-seal');
    
    if (!env.classList.contains('open')) {
        env.classList.add('open');
        
        // Hide the wax seal once the envelope starts opening
        if (seal) seal.style.opacity = '0';
        
        // Load the internal heart animation only if it hasn't been initialized yet
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

/**
 * Manages UI state transitions between different screens.
 * @param {number} step - The ID of the screen to activate.
 */
function nextStep(step) {
    // Hide all screens and activate the target screen
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const nextScreen = document.getElementById(`step-${step}`);
    if (nextScreen) nextScreen.classList.add('active');

    // If reaching the final success screen, load the celebration animation
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

/**
 * Randomizes the position of the 'No' button within the letter boundaries.
 * Prevents the user from clicking the button by moving it on hover.
 */
function moveNoInsideLetter() {
    const btn = document.getElementById('no-btn');
    const area = document.querySelector('.letter-inner');
    
    if (!btn || !area) return;

    // Set position to absolute to allow coordinate-based movement
    btn.style.position = 'absolute';

    // Calculate maximum available space within the letter container
    const maxX = area.clientWidth - btn.offsetWidth;
    const maxY = area.clientHeight - btn.offsetHeight;
    
    // Generate random coordinates within the calculated safe area
    const randomX = Math.max(0, Math.floor(Math.random() * maxX));
    const randomY = Math.max(0, Math.floor(Math.random() * maxY));

    // Update button position
    btn.style.left = randomX + 'px';
    btn.style.top = randomY + 'px';
}

/**
 * Collects form data and transmits it to the specified Telegram chat via Bot API.
 * Handles UI feedback during and after the request.
 */
function sendToTelegram() {
    const btn = document.getElementById('final-send-btn');
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const place = document.getElementById('place').value;
    const wish = document.getElementById('wish').value;

    // Validate mandatory fields before submission
    if (!date || !time) {
        alert("Пожалуйста, выбери дату и время!");
        return;
    }

    // Disable button to prevent multiple submissions
    btn.disabled = true;
    btn.innerText = "Отправка...";

    // Construct the plain text message for Telegram
    const text = `Ответ!\nДата: ${date}\nВремя: ${time}\nМесто: ${place || 'Не указано'}\nПожелания: ${wish || 'Нет'}`;

    // POST request to Telegram API
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text })
    })
    .then(response => {
        if (response.ok) {
            // Apply exit animation to the envelope wrapper on success
            const envelope = document.getElementById('step-1');
            if (envelope) envelope.style.transform = 'translateY(-1000px)';
            
            // Transition to the final thank-you screen after the animation completes
            setTimeout(() => nextStep(5), 600);
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .catch(err => {
        // Re-enable button on failure to allow retry
        btn.disabled = false;
        btn.innerText = "Ошибка. Попробовать еще раз";
        console.error('Submission error:', err);
    });
}