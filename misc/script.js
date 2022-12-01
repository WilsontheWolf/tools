const files = [
    'rsa.js',
    'functionWrapper.js',
];

const list = document.createElement('ul');
files.forEach(file => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '/misc/' + file;
    a.textContent = file;
    li.appendChild(a);
    list.appendChild(li);
});

document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(list);
});