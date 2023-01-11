import { setup } from "/shared/init.js";

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

setup(() => {
    document.body.appendChild(list);
});