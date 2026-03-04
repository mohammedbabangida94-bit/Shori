// 1. GLOBAL CONFIG
const MY_CLIENT_ID = "shori_magodo_001"; 
const MASTER_SWITCH_URL = "https://raw.githubusercontent.com/mohammedbabangida94-bit/Vigilant-Admin/refs/heads/main/sys_check_772.json";

// 2. GLOBAL STATE (Shared across all functions)
let isSent = false;
let countdown;
let timeLeft = 3;

// 3. UTILITY FUNCTIONS
function renderRestrictedUI(lang) {
    const labels = {
        'yoruba': { title: 'Ìhámọ́ Wo Inú Ibí', msg: 'A ti dádúró fún ìgbà díẹ̀.', contact: 'Alákòóso Ètò' },
        'english': { title: 'Access Restricted', msg: 'Security services suspended.', contact: 'Estate Office' }
    };
    const ui = labels[lang] || labels['english'];
    document.body.innerHTML = `
        <div style="background:#000;color:#fff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:15px solid #d32f2f;">
            <h1 style="color:#d32f2f;">${ui.title}</h1>
            <p>${ui.msg}<br>Contact: ${ui.contact}</p>
        </div>`;
    window.stop();
}

window.activateApp = () => {
    const inputID = document.getElementById('vgn-id-input').value.trim();
    if (inputID) {
        localStorage.setItem('vgn_user_id', inputID);
        location.reload(); 
    } else {
        alert("Please enter a valid Subscriber ID.");
    }
};

window.stopAll = () => {
    if (confirm("Ṣé o fẹ́ dá ìdágìrì dúró? (Stop Alarm?)")) {
        const siren = document.getElementById('sirenAudio');
        if (siren) { siren.pause(); siren.currentTime = 0; }
        if (navigator.vibrate) navigator.vibrate(0);
        isSent = false;
        location.reload();
    }
};

// 4. MAIN ENGINE
document.addEventListener('DOMContentLoaded', async () => {
    const savedID = localStorage.getItem('vgn_user_id');
    const gate = document.getElementById('registration-gate');

    // A. Registration Gate
    if (!savedID) {
        if (gate) gate.style.display = 'flex';
        return; 
    }

    // B. Subscription Validation
    try {
        const response = await fetch(`${MASTER_SWITCH_URL}?t=${new Date().getTime()}`);
        const statusData = await response.json();
        
        if (statusData[MY_CLIENT_ID] !== "active" || statusData[savedID] !== "active") {
            renderRestrictedUI('yoruba');
            return;
        }
    } catch (error) {
        console.warn("Offline - Proceeding.");
    }

    // C. Setup UI Elements (NOTICE: No 'const' here because they are used globally)
    const sosButton = document.getElementById('sos-btn');
    const statusMsg = document.getElementById('statusMsg');
    const timerDisplay = document.getElementById('timer');
    const stopBtn = document.getElementById('stop-btn');
    const siren = document.getElementById('sirenAudio');

    if (gate) gate.style.display = 'none';

    // D. SOS Logic
    const startSOS = () => {
        if (isSent) return;
        timeLeft = 3;
        timerDisplay.innerText = timeLeft;
        sosButton.classList.add('active');
        statusMsg.innerText = "Di mu fun iseju meta...";
        
        countdown = setInterval(() => {
            timeLeft--;
            timerDisplay.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                finishSOS(); 
            }
        }, 1000);
    };

    const cancelSOS = () => {
        if (isSent) return;
        clearInterval(countdown);
        sosButton.classList.remove('active');
        timerDisplay.innerText = "";
        statusMsg.innerText = "Shori Ready";
    };

    const finishSOS = () => {
        isSent = true;
        sosButton.classList.add('sent');
        statusMsg.innerText = "A n kigbe...";
        
        const isStealth = localStorage.getItem('vgn_stealth_mode') === 'true';
        
        navigator.geolocation.getCurrentPosition((position) => {
            const mapUrl = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            // (Your showSmsButton logic goes here)
            
            if (!isStealth && siren) {
                siren.play().catch(e => console.log("Audio Blocked"));
                if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
            }
        });
    };

    // E. Listeners
    if (sosButton) {
        sosButton.addEventListener('mousedown', startSOS);
        sosButton.addEventListener('mouseup', cancelSOS);
        sosButton.addEventListener('touchstart', (e) => { e.preventDefault(); startSOS(); });
        sosButton.addEventListener('touchend', cancelSOS);
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', window.stopAll);
    }
});