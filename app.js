// 1. IDENTITY & CONFIG
const MY_CLIENT_ID = "shori_magodo_001"; 
const MASTER_SWITCH_URL = "https://raw.githubusercontent.com/mohammedbabangida94-bit/Vigilant-Admin/refs/heads/main/sys_check_772.json";

// 2. GLOBAL STATE (Defining these here so all functions can see them)
let isSent = false;
let countdown;
let timeLeft = 3;

// 3. THE LOCKOUT UI
function renderRestrictedUI(lang) {
    const labels = {
        'yoruba': { title: 'Ìhámọ́ Wo Inú Ibí', msg: 'A ti dádúró fún ìgbà díẹ̀.', contact: 'Alákòóso Ètò' },
        'english': { title: 'Access Restricted', msg: 'Security services suspended.', contact: 'Estate Office' }
    };
    const ui = labels[lang] || labels['english'];
    document.body.innerHTML = `
        <div style="background:#000;color:#fff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:15px solid #d32f2f;">
            <h1 style="color:#d32f2f;">${ui.title}</h1>
            <p>${ui.msg}<br>Contact: <strong>${ui.contact}</strong></p>
        </div>`;
    window.stop();
}

// 4. THE SMS TOOL
 const showSmsButton = (mapUrl = "") => {
    const blood = localStorage.getItem('vgn_blood') || "Not Stated";
    const allergies = localStorage.getItem('vgn_allergies') || "None Reported";
    const history = localStorage.getItem('vgn_history') || "None";
    const userId = localStorage.getItem('vgn_user_id') || "Guest";
    const primaryNum = document.getElementById('contact1')?.value || "+234...";

const smsBody = `VGN EMERGENCY ALERT%0A` +
                `ID: ${userId}%0A` +
                `Blood: ${blood}%0A` +
                `Allergies: ${allergies}%0A` +
                `Location: ${mapUrl || "Searching..."}`;

const smsUrl = `sms:${primaryNum}?body=${encodeURIComponent(smsBody).replace(/%250A/g, '%0A')}`;

document.getElementById('statusMsg').innerHTML = `
        <a href="${smsUrl}" style="background: #25D366; display:block; padding: 20px; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; text-align: center;">
           📲 ACTIVATE EMERGENCY SMS
        </a>
    `;
};

// 5. REGISTRATION FUNCTION
window.activateApp = () => {
    const inputID = document.getElementById('vgn-id-input').value.trim();
    if (inputID) {
        localStorage.setItem('vgn_user_id', inputID);
        location.reload(); 
    } else {
        alert("Please enter a valid Subscriber ID.");
    }
};

// 6. FINISH SOS (The Payload)
const finishSOS = async () => {
    isSent = true;
    const sosButton = document.getElementById('sos-btn');
    const statusMsg = document.getElementById('statusMsg');
    const siren = document.getElementById('sirenAudio');

    if (sosButton) sosButton.classList.add('sent');
    if (statusMsg) statusMsg.innerText = "A n kigbe...";

    const isStealth = localStorage.getItem('vgn_stealth_mode') === 'true';

    navigator.geolocation.getCurrentPosition(async (position) => {
        const mapUrl = `http://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
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
    // 1. Ask for confirmation first
    const confirmReset = confirm("Ṣé o fẹ́ dá ìdágìrì dúró? \n(Do you want to stop the alarm?)");

    if (confirmReset) {
        const siren = document.getElementById('sirenAudio');
        
        // 2. Kill the sound and vibration immediately
        if (siren) {
            siren.pause();
            siren.currentTime = 0;
        }
        if (navigator.vibrate) navigator.vibrate(0);

        // 3. Clear UI variables
        isSent = false;

        // 4. Hard Reset
        // This re-validates the ID against GitHub and cleans the UI
        location.reload();
    } else {
        // User clicked 'Cancel', keep the alarm going
        console.log("Reset cancelled by user. Alarm continuing.");
    }
};

// --- MAIN INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    const savedID = localStorage.getItem('vgn_user_id');
    const gate = document.getElementById('registration-gate');

    // Step A: Check Registration
    if (!savedID) {
        if (gate) gate.style.display = 'flex';
        return; 
    }

    // Step B: Check Subscription
    try {
        const response = await fetch(`${MASTER_SWITCH_URL}?t=${new Date().getTime()}`);
        const statusData = await response.json();
        
        // To this (Temporary for testing):
if (statusData[MY_CLIENT_ID] !== "active") {
    console.log("Master Switch is:", statusData[MY_CLIENT_ID]);
  // renderRestrictedUI('yoruba');
           // return;
       }
    } catch (error) {
        console.warn("Connection error - proceeding with local data.");
    }

    // B. SECOND: Validate subscription
try {
    const response = await fetch(`${MASTER_SWITCH_URL}?t=${new Date().getTime()}`);
    const statusData = await response.json();
    
    // Check Master Estate Switch First
    if (statusData[MY_CLIENT_ID] !== "active") {
        console.error("Master Switch Suspended");
        renderRestrictedUI('yoruba');
        return;
    }

    // Check Individual User ID
    if (statusData[savedID] !== "active") {
        console.error("User ID Suspended:", savedID);
        // If the ID they saved isn't 'active' in your JSON, log them out
        renderRestrictedUI('yoruba');
        return;
    }
    
    // IF EVERYTHING IS OK:
    console.log("Access Granted to:", savedID);
    if (gate) gate.style.display = 'none'; // Hide the gate if it was open

} catch (error) {
    console.warn("Connection error - allowing local access.");
}

    // Step C: Setup UI Elements
const sosButton = document.getElementById('sos-btn');
const statusMsg = document.getElementById('statusMsg');
const timerDisplay = document.getElementById('timer');

    if (!sosButton) return;

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

    // Event Listeners
    sosButton.addEventListener('mousedown', startSOS);
    sosButton.addEventListener('mouseup', cancelSOS);
    sosButton.addEventListener('touchstart', (e) => { e.preventDefault(); startSOS(); });
    sosButton.addEventListener('touchend', cancelSOS);

    // Settings Persistence
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