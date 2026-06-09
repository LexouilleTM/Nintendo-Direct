let targetDate = null;
let countdownInterval = null;

fetch('directs.json')
    .then(response => {
        if (!response.ok) throw new Error("Error loading Direct data");
        return response.json();
    })
    .then(data => {
        initNextDirect(data);
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById('direct-title').innerText = "Error loading dates";
    });

function initNextDirect(directsList) {
    const now = new Date().getTime();
    
    const upcomingDirects = directsList
        .map(direct => {
            const baseDateString = direct.date;
            
            const approxDate = new Date(baseDateString);
            const parisFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Europe/Paris',
                timeZoneName: 'longOffset'
            });
            
            const parts = parisFormatter.formatToParts(approxDate);
            const tzPart = parts.find(p => p.type === 'timeZoneName').value;
            
            const offset = tzPart.replace('GMT', ''); 
            const exactDate = new Date(baseDateString + offset);

            return {
                ...direct,
                parsedDate: exactDate
            };
        })
        .filter(direct => direct.parsedDate.getTime() > now)
        .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    if (upcomingDirects.length === 0) {
        document.getElementById('direct-title').innerText = "No direct scheduled";
        document.getElementById('display-date').innerText = "--/--/----";
        return;
    }

    const nextDirect = upcomingDirects[0];
    targetDate = nextDirect.parsedDate;

    if (nextDirect.title) {
        document.getElementById('direct-title').innerText = `${nextDirect.title}`;
    }

    const localFormatter = new Intl.DateTimeFormat(navigator.language, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    document.getElementById('display-date').innerText = localFormatter.format(targetDate);

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!targetDate) return;
    const now = new Date().getTime();
    const difference = targetDate.getTime() - now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    } else {
        clearInterval(countdownInterval);
        document.getElementById('days').innerText = "00";
        document.getElementById('hours').innerText = "00";
        document.getElementById('minutes').innerText = "00";
        document.getElementById('seconds').innerText = "00";
        
        document.getElementById('direct-title').innerText = "Nintendo is live!";
    }
}
