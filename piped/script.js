const setup = document.getElementById('setup');
const feed = document.getElementById('feed');
const content = document.getElementById('feed-content');

const videoBase = 'https://piped.shorty.systems'; // I can't get this from the api without getting both feed types.
let apiBase;
const selected = new Map();

const relativeUrl = (url) => new URL(url, videoBase).toString();

const handleDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    const parts = [];
    if (hours) parts.push(hours);
    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(seconds.toString().padStart(2, '0'));
    return parts.join(':');
};

const arrows = [];
const requestArrow = (link, callback) => {
    link = new URL(link, videoBase);
    const id = link.searchParams.get('v');
    if (!id) return;
    arrows.push({ id, callback });
};

const handleArrows = async () => {
    const url = `https://${apiBase}/dearrow/?videoIds=${arrows.map(a => a.id).join(',')}`;
    const res = await fetch(url).catch((e) => e);
    if (res instanceof Error) {
        console.error('Error fetching arrows!', res);
        return;
    }
    if (!res.ok) {
        console.error('Error fetching arrows!', res);
        return;
    }
    const data = await res.json().catch((e) => e);
    if (data instanceof Error) {
        console.error('Error parsing arrows!', data);
        return;
    }
    arrows.forEach((arrow) => {
        arrow.callback(data[arrow.id]);
    });
};

const load = async (url) => {
    const urlObject = new URL(url);
    if (urlObject.pathname.endsWith('/rss'))
        urlObject.pathname = urlObject.pathname.slice(0, -4);
    url = urlObject.toString();
    apiBase = urlObject.hostname;
    content.innerText = 'Loading...';
    const res = await fetch(url).catch((e) => e);
    if (res instanceof Error) {
        content.innerText = 'Error loading feed!';
        content.innerHTML += '<br>';
        content.innerText += res.message;
        return;
    }
    if (!res.ok) {
        content.innerText = 'Error loading feed! ' + res.statusText + ' (' + res.status + ')';
        content.innerHTML += '<br>';
        content.innerText += await res.text();
        return;
    }

    // Parse JSON
    /** @type {object[]} */
    const json = await res.json().catch((e) => e);
    if (json instanceof Error) {
        content.innerText = 'Error parsing feed!';
        content.innerHTML += '<br>';
        content.innerText += json.message;
        return;
    }
    console.log(json);

    content.innerHTML = ``;

    const imgHeight = document.body.clientWidth / 1.7; // Prevents moving the page
    json.slice(0, 200).forEach((item) => {
        if (item.isShort) return;
        const div = document.createElement('div');
        div.classList.add('item');
        const imgEl = document.createElement('img');
        imgEl.height = imgHeight; // Rough height of a youtube thumbnail
        imgEl.onload = () => {
            imgEl.removeAttribute('height');
            // Prevents the image from being stretched
        };
        div.appendChild(imgEl);
        const titleEl = document.createElement('h2');
        div.appendChild(titleEl);
        const watchButton = document.createElement('a');
        watchButton.innerHTML = '<button>Watch</button>';
        div.appendChild(watchButton);
        const link = relativeUrl(item.url);

        watchButton.href = link;

        const audioButton = document.createElement('button');
        audioButton.innerText = 'Download Audio';
        const videoButton = document.createElement('button');
        videoButton.innerText = 'Download Video';
        const cancel = document.createElement('button');
        cancel.innerText = 'Cancel';
        cancel.disabled = true;
        const downloadDiv = document.createElement('div');
        downloadDiv.appendChild(audioButton);
        downloadDiv.appendChild(videoButton);
        downloadDiv.appendChild(cancel);
        div.appendChild(downloadDiv);

        audioButton.onclick = () => {
            audioButton.innerText = '✅ Download Audio';
            videoButton.innerText = 'Download Video';
            cancel.disabled = false;
            selected.set(link, 'audio');
        };

        videoButton.onclick = () => {
            audioButton.innerText = 'Download Audio';
            videoButton.innerText = '✅ Download Video';
            cancel.disabled = false;
            selected.set(link, 'video');
        };

        cancel.onclick = () => {
            audioButton.innerText = 'Download Audio';
            videoButton.innerText = 'Download Video';
            cancel.disabled = true;
            selected.delete(link);
        };

        const titleSpan = document.createElement('span');
        titleSpan.innerText = item.title;
        titleEl.appendChild(titleSpan);

        const authorEl = document.createElement('span');
        authorEl.innerText = ' by ';
        authorEl.classList.add('author');
        const authorLink = document.createElement('a');
        authorLink.innerText = item.uploaderName;
        authorLink.href = relativeUrl(item.uploaderUrl);
        authorEl.appendChild(authorLink);

        const durationEl = document.createElement('span');
        durationEl.innerText = ' - [' + handleDuration(item.duration) + ']';
        authorEl.appendChild(durationEl);

        titleEl.appendChild(authorEl);
        imgEl.src = item.thumbnail;

        requestArrow(link, (arrow) => {
            const thumbnail = arrow.thumbnails[0];
            if (thumbnail && (thumbnail.locked || thumbnail.votes >= 0 && !thumbnail.original)) {
                imgEl.src = thumbnail.thumbnail;
            }
            const title = arrow.titles[0];
            if (title && (title.locked || title.votes >= 0)) {
                titleSpan.innerText = title.title;
            }

        });

        content?.appendChild(div);
    });
    await handleArrows();
};

let url = window.localStorage.getItem('pipedUrl');
if (url === null) {
    const form = document.querySelector('#setup form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('url').value;
        window.localStorage.setItem('pipedUrl', url);
        setup.hidden = true;
        feed.hidden = false;
        load(url);
    });
    setup.hidden = false;
} else {
    feed.hidden = false;
    load(url);
}

const reset = document.getElementById('reset');
reset.addEventListener('click', () => {
    window.localStorage.removeItem('pipedUrl');
    window.location.reload();
});

const finish = document.getElementById('finish');
finish.addEventListener('click', () => {
    if (selected.size === 0) return alert('No videos selected!');
    const audio = [];
    const video = [];
    selected.forEach((type, link) => {
        const url = new URL(link);
        const v = url.searchParams.get("v");
        url.hostname = 'youtu.be';
        url.search = ""
        url.pathname = `/${v}`

        if (type === 'audio') audio.push(url.toString());
        else video.push(url.toString());
    });

    let fin = '';
    if (audio.length) {
        fin += 'yt-wa ' + audio.join(' ');
        if (video.length) fin += ' ; ';
    }
    if (video.length) fin += 'yt-v ' + video.join(' ');

    console.log(fin);

    navigator.clipboard.writeText(fin).then(() => {
        alert('Copied to clipboard!');
    });

    const text = document.createElement('pre');
    text.innerText = fin;
    content?.prepend(text);
});
