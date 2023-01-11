import { setup } from "/shared/init.js";

let toCopy, output;

window.fetchTimezone = () => {
    const output = document.getElementById('timezone');
    
    window.fetch('https://worldtimeapi.org/api/ip')
        .then(response => response.json())
        .then(data => {
    		toCopy = data.timezone;
            output.innerHTML = `<code>${data.timezone}</code> <a href="javascript:alert('Fetched from worldtimeapi.org for ip ${data.client_ip}');">i</a>` || 'Timezone not found.';
        });
}

setup(({ timezone: out, copy}) => {

    output = out;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) {
        output.innerHTML = 'Timezone not found. Consider clicking the button below to fetch it.';
    } else {
    	toCopy = timezone;
        output.innerHTML = `<code>${timezone}</code>`;

        if (!timezone.includes('/') || timezone.startsWith('Etc/')) {
            output.innerHTML += ' (This timezone does not seem to be very accurate. Consider clicking the button below to fetch it.)';
        }
    }

	copy.addEventListener('click', () => {
		navigator.clipboard.writeText(toCopy);
	})
}, ['timezone', 'copy']);
