const setup = document.getElementById('setup');
const feed = document.getElementById('feed');
const content = document.getElementById('feed-content');

const selected = new Map();
console.log(selected);

const load = async (url) => {
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

    // Parse XML
    const xml = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode !== null) {
        content.innerText = 'Error parsing feed!';
        content.innerHTML += '<br>';
        content.innerText += errorNode.textContent;
        return;
    }

    console.log(doc);

    const items = doc.querySelectorAll('entry');

    content.innerHTML = ``;

    items.forEach((item) => {
        const div = document.createElement('div');
        div.classList.add('item');
        const imgEl = document.createElement('img');
        imgEl.height = 450; // Rough height of a youtube thumbnail
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

        const link = item.querySelector('link')?.getAttribute('href');
        if (!link) return;
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
            audioButton.innerText =  '✅ Download Audio';
            videoButton.innerText = 'Download Video';
            cancel.disabled = false;
            selected.set(link, 'audio');
        };

        videoButton.onclick = () => {
            audioButton.innerText =  'Download Audio';
            videoButton.innerText = '✅ Download Video';
            cancel.disabled = false;
            selected.set(link, 'video');
        };

        cancel.onclick = () => {
            audioButton.innerText =  'Download Audio';
            videoButton.innerText = 'Download Video';
            cancel.disabled = true;
            selected.delete(link);
        };

        const title = item.querySelector('title')?.innerHTML;
        titleEl.innerText = title;
        if (title?.includes('#shorts')) return;

        const author = item.querySelector('author');
        if (author) {
            const name = author.querySelector('name')?.innerHTML;
            const link = author.querySelector('uri')?.innerHTML;
            const authorEl = document.createElement('span');
            authorEl.innerText = ' by ';
            authorEl.classList.add('author');
            const authorLink = document.createElement('a');
            authorLink.innerText = name;
            authorLink.href = link;
            authorEl.appendChild(authorLink);

            titleEl.appendChild(authorEl);
        }
        const img = item.querySelector('img')?.src;
        if (img) imgEl.src = img;
        else imgEl.hidden = true;


        content?.appendChild(div);
    });
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
    if(selected.size === 0) return alert('No videos selected!');
    const audio = [];
    const video = [];
    selected.forEach((type, link) => {
        const url = new URL(link);
        url.hostname = 'youtube.com';

        if(type === 'audio') audio.push(url.toString());
        else video.push(url.toString());
    });

    let fin = '';
    if(audio.length) {
        fin += 'yt-wa ' + audio.join(' ');
        if(video.length) fin += ' && ';
    }
    if(video.length) fin += 'yt-v ' + video.join(' ');

    console.log(fin);

    navigator.clipboard.writeText(fin).then(() => {
        alert('Copied to clipboard!');
    });

    const text = document.createElement('pre');
    text.innerText = fin;
    content?.prepend(text);
});
