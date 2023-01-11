/**
 * Sets up a function to be called when the DOM is loaded and gets elements.
 * @param {Function} func - The function to call when loaded. The first arg will be the elements requested.
 * @param {string[]} [elements] - The ids of the elements to pass to the function.
 */
const setup = (func, elements = []) => {
    window.addEventListener('DOMContentLoaded', () => {
        const e = {};
        elements.forEach(el => e[el] = document.getElementById(el));
        func(e);
    });
};

export {
    setup,
}