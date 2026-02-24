
// 1. IDENTITY CHECK (Must match GitHub JSON exactly)
const MY_CLIENT_ID = "shori_magodo_001"; 

// 2. MASTER LEDGER URL
const MASTER_SWITCH_URL = "https://raw.githubusercontent.com/mohammedbabangida94-bit/Vigilant-Admin/refs/heads/main/sys_check_772.json";

/**
 * THE COMMAND CENTER CHECK
 */
async function validateAccess() {
    try {
        // We add a timestamp (?t=...) to the end of the URL to bypass the browser cache
        const response = await fetch(`${MASTER_SWITCH_URL}?t=${new Date().getTime()}`);
        
        if (!response.ok) throw new Error("Could not reach GitHub");

        const statusData = await response.json();
        
        console.log("Status Data Received:", statusData);
        console.log("Checking status for:", MY_CLIENT_ID);

        // 3. THE SWITCH TRIGGER
        if (statusData[MY_CLIENT_ID] !== "active") {
            console.warn("ACCESS SUSPENDED. Loading UI...");
            renderRestrictedUI('yoruba');
        } else {
            console.log("ACCESS ACTIVE. Welcome to Amanat.");
        }
    } catch (error) {
        console.error("System Check Failed:", error);
        // Default to active so the app works if GitHub is down
    }
}

/**
 * THE RESTRICTED UI FUNCTION
 */
function renderRestrictedUI(lang) {
    const labels = {
        'english': { title: 'Access Restricted', msg: 'Security services for this zone have been suspended.', contact: 'Estate Office' },
        'yoruba': { title: 'Ìhámọ́ Wo Inú Ibí', msg: 'A ti dádúró fún ìgbà díẹ̀.', contact: 'Alákòóso Ètò' },
        'hausa': { title: 'An Takaita Shiga', msg: 'An dakatar da wannan akant dinka.', contact: 'mai kula da shirin' }
    };

    // Use English if the selected language isn't found
    const ui = labels[lang] || labels['english'];

    document.body.innerHTML = `
        <div style="background-color: #000; color: #fff; height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; border: 15px solid #d32f2f; box-sizing: border-box; position: fixed; top: 0; left: 0; z-index: 9999;">
            <div style="font-size: 80px; color: #d32f2f; margin-bottom: 20px;">⚠️</div>
            <h1 style="text-transform: uppercase; color: #d32f2f; margin: 0; font-size: 24px;">${ui.title}</h1>
            <p style="font-size: 18px; max-width: 300px; margin: 20px;">${ui.msg}<br><br>Please contact <strong>${ui.contact}</strong>.</p>
            <div style="background: #d32f2f; padding: 10px 20px; border-radius: 5px; font-weight: bold;">REF: ${MY_CLIENT_ID}</div>
            <p style="margin-top: 40px; font-size: 10px; color: #444;">VIGILANTNG SECURITY SUITE</p>
        </div>
    `;
    
    // Stop the rest of the app from loading
    window.stop(); 
    throw new Error("Execution halted: Access Suspended.");
}

// 4. RUN THE CHECK
validateAccess();

document.addEventListener('DOMContentLoaded', () => {
    const sosButton = document.getElementById('sos-btn');
    const statusMsg = document.getElementById('statusMsg');
    const timerDisplay = document.getElementById('timer');
    const siren = document.getElementById('sirenAudio');

    let countdown;
    let timeLeft = 3;
    let isSent = false;

    // AUDIO PRIMING: Mobile browsers need one "legal" touch to allow sound
    const primeAudio = () => {
        siren.play().then(() => {
            siren.pause(); // Start and immediately pause to "unlock" it
            siren.currentTime = 0;
        }).catch(e => console.log("Waiting for user interaction..."));
        // Remove this listener after first touch
        document.removeEventListener('touchstart', primeAudio);
    };
    document.addEventListener('touchstart', primeAudio);

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

    // Trigger Siren & Vibration
    siren.play().catch(e => console.log("Audio blocked: " + e));
    if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]); // SOS pattern
    }

    const showSmsButton = (mapUrl = "") => {
        const primaryNum = document.getElementById('contact1').value;
        const locationText = mapUrl ? ` My location: ${mapUrl}` : " (Location unavailable)";
        const smsBody = `EMERGENCY! I need help.${locationText}`;
        const smsUrl = `sms:${primaryNum}?body=${encodeURIComponent(smsBody)}`;

        statusMsg.innerHTML = `
            <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px; width: 100%;">
                <a href="${smsUrl}" style="background: #25D366; color: white; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: bold; text-align: center; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">📲 FI SMS RANSE NIYI</a>
                <button onclick="stopAll()" style="background: #ff4444; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer;">🔇 STOP SIREN & RESET</button>
            </div>
        `;
    };

    // Try to get location, but don't wait forever
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const mapUrl = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            showSmsButton(mapUrl);
        },
        (error) => {
            console.log("GPS Failed:", error.message);
            showSmsButton(); // Show button anyway without location
        },
        { timeout: 8000 } // Wait max 8 seconds for GPS
    );
};
    window.stopAll = () => {
        siren.pause();
        siren.currentTime = 0;
        location.reload(); // Hard reset for safety
    };

    sosButton.addEventListener('mousedown', startSOS);
    sosButton.addEventListener('mouseup', cancelSOS);
    sosButton.addEventListener('touchstart', (e) => { e.preventDefault(); startSOS(); });
    sosButton.addEventListener('touchend', cancelSOS);
});