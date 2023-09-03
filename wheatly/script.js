let data = (async () =>
    await fetch('/wheatly/data.json').then((res) => {
        if (!res.ok) {
            alert('Error loading data!');
            return setTimeout(() => window.location.reload(), 5000);
        }
        return res.json();
    })

)()

window.play = async () => {
    const d = await data;
    if (!d) return;
    const url = d[Math.floor(Math.random() * d.length)];
    const audio = new Audio(url);
    await audio.play();
}