let input, output, err, options;

const cursor = '\\cursor'
const preMath = '\\def\\cursor{{\\color{yellow}\\Downarrow}}'

const showError = (error) => {
    console.error(error);
    if (!err) return;
    err.innerText = error.message;
    err.hidden = false;

    if (!output) return;
    output.innerText = '';
};

const hideError = () => {
    if (!err) return;
    err.hidden = true;
}

const defaultOptions = {
    cursor: true,
}
const getOptions = () => {
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
}

const genMath = (math) => {
    if (!math) return '';
    if (!getOptions().cursor) return math;
    return preMath + '\n' + math;
};

const render = () => {
    if (!input || !output) throw new Error('Page not loaded properly');
    if (!katex) throw new Error('Katex not loaded properly.');
    let math = input.value;
    if (!math) return output.innerText = '';
    const {cursor: shouldShowPos} = getOptions();
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
    katex.render(genMath(math), output, {
        throwOnError: false,
    });
};

const renderWithErrorHandler = () => {
    try {
        hideError();
        render();
    } catch (error) {
        showError(error);
    }
}


window.addEventListener('DOMContentLoaded', () => {
    input = document.getElementById('input');
    output = document.getElementById('output');
    err = document.getElementById('error');
    options = document.getElementById('options');
    input.addEventListener('input', renderWithErrorHandler);
    input.addEventListener('selectionchange', renderWithErrorHandler);
    Array.from(options.children).forEach(c => {
        c.addEventListener('change', renderWithErrorHandler);
    });
    renderWithErrorHandler();
});