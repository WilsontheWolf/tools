const secondsBox = document.getElementById('seconds');
const minutesBox = document.getElementById('minutes');
const hoursBox = document.getElementById('hours');
const dayBox = document.getElementById('day');
const title = document.querySelector('title');

function handleTime() {
    const time = Date.now();
    const date = new Date(time);
    const seconds = (time / 1000) % 60;
    const localMinutes = date.getMinutes() + seconds / 60;
    const localHours = date.getHours() + localMinutes / 60;
    const day = (localHours) % 24;
    const hours = (localHours) % 6;
    const minutes = (localMinutes) % 60;
    secondsBox.style.backgroundColor = `hsl(${seconds * 6}, 100%, 50%)`;
    minutesBox.style.backgroundColor = `hsl(${minutes * 6}, 100%, 50%)`;
    hoursBox.style.backgroundColor = `hsl(${hours * 60}, 100%, 50%)`;
    dayBox.style.backgroundColor = `hsl(${day * 15}, 100%, 50%)`;
    // Debug time display:
    // title.innerText = `${Math.floor(day)}:${Math.floor(hours)}:${Math.floor(minutes)}:${Math.floor(seconds)} (${date.toLocaleTimeString()})`;
    window.requestAnimationFrame(handleTime);

};

window.requestAnimationFrame(handleTime);
