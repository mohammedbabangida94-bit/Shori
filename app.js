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