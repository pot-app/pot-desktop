export const debounce = (fn, delay = 500) => {
    let timer = null;
    return (...args) => {
        timer && clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};
