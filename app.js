// 1. GLOBAL STATE
let isSent = false;
let countdown;
let timeLeft = 3;

// 2. THE MEDICAL PAYLOAD & SMS TOOL
const showSmsButton = (mapUrl = "") => {
    const blood = localStorage.getItem('vgn_blood') || "Not Stated";
    const allergies = localStorage.getItem('vgn_allergies') || "None";
    const contactNum = document.getElementById('contact1')?.value || "+234...";

    const smsBody = `EMERGENCY ALERT%0A` +
                    `Blood: ${blood}%0A` +
                    `Allergies: ${allergies}%0A` +
                    `Location: ${mapUrl || "Searching..."}`;

    const smsUrl = `sms:${contactNum}?body=${encodeURIComponent(smsBody).replace(/%250A/g, '%0A')}`;

    document.getElementById('statusMsg').innerHTML = `
        <a href="${smsUrl}" style="background: #25D366; display:block; padding: 20px; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; text-align: center;">
           📲 SEND EMERGENCY SMS
        </a>`;
};

// 3. MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    const sosButton = document.getElementById('sos-btn');
    const statusMsg = document.getElementById('statusMsg');
    const timerDisplay = document.getElementById('timer');
    const siren = document.getElementById('sirenAudio');

    // SOS START
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

    // SOS FINISH (The Intelligence Part)
    const finishSOS = () => {
        isSent = true;
        sosButton.classList.add('sent');
        statusMsg.innerText = "A n kigbe...";
        
        // CHECK STEALTH MODE
        const isStealth = localStorage.getItem('vgn_stealth_mode') === 'true';
        
        navigator.geolocation.getCurrentPosition((position) => {
            const mapUrl = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
            showSmsButton(mapUrl);
            
            if (!isStealth && siren) {
                siren.play().catch(e => console.log("Audio Blocked"));
            }
        }, (err) => {
            showSmsButton("Location Unavailable");
        });
    };

    // SOS CANCEL
    const cancelSOS = () => {
        if (isSent) return;
        clearInterval(countdown);
        sosButton.classList.remove('active');
        timerDisplay.innerText = "";
        statusMsg.innerText = "Ready";
    };

    // Event Listeners
    sosButton.addEventListener('mousedown', startSOS);
    sosButton.addEventListener('mouseup', cancelSOS);
    sosButton.addEventListener('touchstart', (e) => { e.preventDefault(); startSOS(); });
    sosButton.addEventListener('touchend', cancelSOS);

    // Settings Persistence (Stealth & Meds)
    const stealthToggle = document.getElementById('stealthToggle');
    const bloodInput = document.getElementById('bloodGroup');

    if(stealthToggle) {
        stealthToggle.checked = localStorage.getItem('vgn_stealth_mode') === 'true';
        stealthToggle.addEventListener('change', () => localStorage.setItem('vgn_stealth_mode', stealthToggle.checked));
    }
    if(bloodInput) {
        bloodInput.value = localStorage.getItem('vgn_blood') || '';
        bloodInput.addEventListener('input', () => localStorage.setItem('vgn_blood', bloodInput.value));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab UI Elements
    const stealthToggle = document.getElementById('stealthToggle');
    const bloodInput = document.getElementById('bloodGroup');
    const allergiesInput = document.getElementById('allergies');
    const siren = document.getElementById('sirenAudio');

    // 2. Load Saved Data from LocalStorage
    if(stealthToggle) {
        stealthToggle.checked = localStorage.getItem('vgn_stealth_mode') === 'true';
        stealthToggle.addEventListener('change', () => {
            localStorage.setItem('vgn_stealth_mode', stealthToggle.checked);
        });
    }

    if(bloodInput) {
        bloodInput.value = localStorage.getItem('vgn_blood') || '';
        bloodInput.addEventListener('input', () => {
            localStorage.setItem('vgn_blood', bloodInput.value);
        });
    }

    if(allergiesInput) {
        allergiesInput.value = localStorage.getItem('vgn_allergies') || '';
        allergiesInput.addEventListener('input', () => {
            localStorage.setItem('vgn_allergies', allergiesInput.value);
        });
    }

    // 3. The Stealth Siren Logic (Used inside your finishSOS)
    window.playSiren = () => {
        const isStealth = localStorage.getItem('vgn_stealth_mode') === 'true';
        if (!isStealth && siren) {
            siren.play().catch(e => console.log("Audio Blocked by Browser"));
            if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
        } else {
            console.log("Stealth Active: Siren & Vibration disabled.");
        }
    };
});