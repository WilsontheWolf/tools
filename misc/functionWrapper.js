const isWrapped = Symbol('isWrapped');

const fancyLog = (name, ...msg) => {
  const start = `%c[Wrapper${name && name !== 'anonymous' ? `:${name}` : ''}]`;
  console.log(start, 'color: green', ...msg);
};

const functionListener = {
  apply: function (target, thisArg, argumentsList) {
    const name = target.name;
    const log = fancyLog.bind(null, name);
    try {
      const returnValue = target.apply(thisArg, argumentsList);
      log('Function called with arguments: ', argumentsList);
      log('Function returned: ', returnValue);
      return returnValue;
    } catch (e) {
      log('Function called with arguments: ', argumentsList);
      log('Function threw an error: ', e);

      throw e;

    }
  }, 
  // Add property so we can tell if already wrapped
  get: function (target, prop, receiver) {
    if (prop === isWrapped) {
      return true;
    }
    return Reflect.get(target, prop, receiver);
  }
};

const wrap = (func) => {
  if (func[isWrapped]) {
    return func;
  }
  return new Proxy(func, functionListener);
};



////////////////////////
//// Example usage /////
////////////////////////
const add = (a, b) => a + b;
const wrappedAdd = wrap(add);

console.log(wrappedAdd(1, 2)); // 3

// Example error
const throwError = () => {
  throw new Error('Error!');
}
const wrappedThrowError = wrap(throwError);

try {
  wrappedThrowError();
}
catch (e) {
  console.log(e);
}

// Example replacement
console.warn = wrap(console.warn);

console.warn('Warning!'); // Warning!
