import { setup } from '/shared/init.js';

let el = {};

const cursor = '\\cursor'
const macro = '{\\color{yellow}\\Downarrow}'
const defaultOptions = {
    cursor: true,
};

const showError = (error) => {
    console.error(error);
    const { error: err, output } = el;
    if (!err) return;
    err.innerText = error.message;
    err.hidden = false;

    if (!output) return;
    output.innerText = '';
};

const hideError = () => {
    const { error } = el;
    if (!error) return;
    error.hidden = true;
};

const getOptions = () => {
    const { options } = el;
    if (!options) return defaultOptions;
    return {
        ...defaultOptions,
        ...Array.from(options.children).reduce((acc, c) => {
            if (c.tagName === 'LABEL') return acc;
            const name = c.id;
            let value = undefined;
            if (c.type === 'checkbox') value = c.checked;
            acc[name] = value;
            return acc;
        }, {})
    };
};

const render = () => {
    const { input, output } = el;
    if (!input || !output) throw new Error('Page not loaded properly');
    if (!katex) throw new Error('Katex not loaded properly.');
    let math = input.value;
    if (!math) return output.innerText = '';
    const { cursor: shouldShowPos } = getOptions();
    if (shouldShowPos) {
        // Get cursor pos
        input.focus();
        const pos = input.selectionStart;
        if (pos === math.length) math = math + ` ${cursor}`;
        // Insert "\Downarrow" at nearest border
        else {
            const regex = new RegExp(`^.{${pos}}.*?(\\b|$|^|(?=\\s)|(?<=\\s))`);
            math = math.replace(regex, `$&${cursor} `);
        }
    }
    katex.render(math, output, {
        throwOnError: false,
        macros: cursor ? {'\\cursor': macro} : undefined,
        displayMode: true,
    });
};

const renderWithErrorHandler = () => {
    try {
        hideError();
        render();
    } catch (error) {
        showError(error);
    }
};

setup((elements) => {
    el = elements;
    const { input, options } = el;
    input.addEventListener('input', renderWithErrorHandler);
    input.addEventListener('selectionchange', renderWithErrorHandler);
    Array.from(options.children).forEach(c => {
        c.addEventListener('change', renderWithErrorHandler);
    });
    renderWithErrorHandler();
}, ['input', 'output', 'options', 'error']);
