// 1. IDENTITY & CONFIG (Keep at top)
    const MY_CLIENT_ID = "shori_magodo_001"; 
const MASTER_SWITCH_URL = "https://raw.githubusercontent.com/mohammedbabangida94-bit/Vigilant-Admin/refs/heads/main/sys_check_772.json";

// 2. THE MISSING TOOL: showSmsButton
// Defined globally so finishSOS can find it.
const showSmsButton = (mapUrl = "") => {
    const statusMsg = document.getElementById('statusMsg');
    const primaryNum = document.getElementById('contact1')?.value || "+234XXXXXXXXXX"; 
    const blood = localStorage.getItem('vgn_blood') || "Unknown";
    
    const locationText = mapUrl ? ` My location: ${mapUrl}` : " (Location unavailable)";
    const smsBody = `VGN EMERGENCY! Blood: ${blood}. I need help.${locationText}`;
    const smsUrl = `sms:${primaryNum}?body=${encodeURIComponent(smsBody)}`;

    statusMsg.innerHTML = `
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px; width: 100%;">
            <a href="${smsUrl}" style="background: #25D366; color: white; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: bold; text-align: center; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">📲 FI SMS RANSE NIYI</a>
            <button onclick="window.stopAll()" style="background: #ff4444; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer;">🔇 STOP SIREN & RESET</button>
        </div>
    `;
};

// 3. ACCESS CONTROL
async function validateAccess() {
    try {
    const response = await fetch(`${MASTER_SWITCH_URL}?t=${new Date().getTime()}`);
    if (!response.ok) throw new Error("Could not reach GitHub");
    const statusData = await response.json();
    if (statusData[MY_CLIENT_ID] !== "active") {
        renderRestrictedUI('yoruba');
        }
    } catch (error) {
    console.error("System Check Failed:", error);
    }
}

    function renderRestrictedUI(lang) {
    const labels = {
        'english': { title: 'Access Restricted', msg: 'Security services suspended.', contact: 'Estate Office' },
        'yoruba': { title: 'Ìhámọ́ Wo Inú Ibí', msg: 'A ti dádúró fún ìgbà díẹ̀.', contact: 'Alákòóso Ètò' }
};
    const ui = labels[lang] || labels['english'];
    document.body.innerHTML = `<div style="background:#000;color:#fff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:15px solid #d32f2f;"><h1 style="color:#d32f2f;">${ui.title}</h1><p>${ui.msg}</p></div>`;
    window.stop();
}

    validateAccess();

// 4. MAIN APP INTERACTION
document.addEventListener('DOMContentLoaded', () => {
    const sosButton = document.getElementById('sos-btn');
    const statusMsg = document.getElementById('statusMsg');
    const timerDisplay = document.getElementById('timer');
    const siren = document.getElementById('sirenAudio');

    let countdown;
    let timeLeft = 3;
    let isSent = false;

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

    const finishSOS = async () => {
        isSent = true;
        sosButton.classList.add('sent');
        statusMsg.innerText = "A n kigbe...";

        const isStealth = localStorage.getItem('vgn_stealth_mode') === 'true';
        const medical = {
            blood: localStorage.getItem('vgn_blood') || "Not Provided",
            allergies: localStorage.getItem('vgn_allergies') || "None"
        };

        navigator.geolocation.getCurrentPosition(async (position) => {
            const mapUrl = `http://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            
            // This now works because it's defined at the top!
            showSmsButton(mapUrl);

            if (isStealth) {
                siren.pause();
                console.log("VGN Stealth: Silent");
            } else {
                siren.play().catch(e => console.log("Audio Blocked"));
                if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
            }
        }, (error) => {
            showSmsButton();
        });
    };

    window.stopAll = () => {
        siren.pause();
        location.reload();
    };

    sosButton.addEventListener('mousedown', startSOS);
    sosButton.addEventListener('mouseup', cancelSOS);
    sosButton.addEventListener('touchstart', (e) => { e.preventDefault(); startSOS(); });
    sosButton.addEventListener('touchend', cancelSOS);

    // 5. SETTINGS PERSISTENCE
    const stealthToggle = document.getElementById('stealthToggle');
    const bloodInput = document.getElementById('bloodGroup');
    const allergiesInput = document.getElementById('allergies');

    if(stealthToggle) {
        stealthToggle.checked = localStorage.getItem('vgn_stealth_mode') === 'true';
        stealthToggle.addEventListener('change', () => localStorage.setItem('vgn_stealth_mode', stealthToggle.checked));
    }
    if(bloodInput) {
        bloodInput.value = localStorage.getItem('vgn_blood') || '';
        bloodInput.addEventListener('input', () => localStorage.setItem('vgn_blood', bloodInput.value));
    }
    if(allergiesInput) {
        allergiesInput.value = localStorage.getItem('vgn_allergies') || '';
        allergiesInput.addEventListener('input', () => localStorage.setItem('vgn_allergies', allergiesInput.value));
    }
});