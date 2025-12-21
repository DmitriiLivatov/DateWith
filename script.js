/**
 * Telegram Bot Configuration
 * Warning: For production, move these to a secure backend to prevent token theft.
 */
const TELEGRAM_BOT_TOKEN = '8131140460:AAGpIRs_74_3RrmI9rVEqJhhHnDfOswuanU';
const TELEGRAM_CHAT_ID = '1948777578';

// Global variables for animation state
let heartAnimation = null;
let yesBtnScale = 1; // Scale factor for the "Yes" button growth

/**
 * Initialize animations and pickers on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lottie animations for each step icon
    ['date', 'time', 'place'].forEach(name => {
        const container = document.getElementById(`lottie-${name}-icon`);
        if (container) {
            lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: `${name}.json` // Ensure these JSON files exist in your root directory
            });
        }
    });

    // Initialize Flatpickr for Date selection
    flatpickr("#date", { 
        locale: "ru", 
        dateFormat: "d.m.Y", 
        minDate: "today", 
        disableMobile: true 
    });

    // Initialize Flatpickr for Time selection
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
 * Handles the opening of the envelope and starts the heart animation
 */
function openEnvelope() {
    const env = document.getElementById('envelope');
    const seal = document.getElementById('wax-seal');
    
    if (!env.classList.contains('open')) {
        env.classList.add('open');
        
        // Hide the wax seal once opened
        if (seal) seal.style.opacity = '0';
        
        // Lazy load the inner heart animation
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
 * Manages screen transitions and progress bar updates
 * @param {number} step - The target step index
 */
function nextStep(step) {
    // 1. Screen Switching logic
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const nextScreen = document.getElementById(`step-${step}`);
    if (nextScreen) nextScreen.classList.add('active');

    // 2. Update Progress Bar width (based on 5 steps total)
    const progress = (step / 5) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = `${progress}%`;

    // 3. Visual Effects (Confetti) on milestones
    if (step === 2 || step === 5) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4d6d', '#ff758f', '#ffffff']
        });
    }

    // 4. Load final success animation
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
 * Interactive "No" button logic: moves away on hover and scales the "Yes" button
 */
function moveNoInsideLetter() {
    const btnNo = document.getElementById('no-btn');
    const btnYes = document.querySelector('.btn-yes');
    const area = document.querySelector('.letter-inner');
    
    if (!btnNo || !area) return;

    // Randomize "No" button position within the letter boundaries
    btnNo.style.position = 'absolute';
    const maxX = area.clientWidth - btnNo.offsetWidth;
    const maxY = area.clientHeight - btnNo.offsetHeight;
    btnNo.style.left = Math.random() * maxX + 'px';
    btnNo.style.top = Math.random() * maxY + 'px';

    // Increase the "Yes" button size to make it more appealing
    yesBtnScale += 0.15;
    btnYes.style.transform = `scale(${yesBtnScale})`;
}

/**
 * Submits form data to the Telegram Bot API
 */
function sendToTelegram() {
    const btn = document.getElementById('final-send-btn');
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const place = document.getElementById('place').value;
    const wish = document.getElementById('wish').value;

    // Validation
    if (!date || !time) {
        alert("Please select a date and time!");
        return;
    }

    // UI Feedback
    btn.disabled = true;
    btn.innerText = "Sending...";

    // Format message for Telegram
    const text = `🎉 NEW RESPONSE!\n\n📅 Date: ${date}\n⏰ Time: ${time}\n📍 Place: ${place || 'Up to you'}\n💭 Wishes: ${wish || 'None'}`;

    // API Request
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text })
    })
    .then(res => {
        if (res.ok) {
            nextStep(5); // Success screen
        } else {
            throw new Error('API Error');
        }
    })
    .catch((err) => {
        console.error(err);
        btn.disabled = false;
        btn.innerText = "Error. Try again?";
    });
}