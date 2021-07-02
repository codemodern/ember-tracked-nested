const deepClone = (obj: Array<any> | Object): Array<any> | Object => {
  let clone;
  if (Array.isArray(obj)) {
    clone = [...obj];
  } else {
    // for objects it's common that it can be a proxy
    // or object can have setter getters defined
    // this is to ensure we are properly clone those too
    // we did not do this for array because it causes
    // cloned array using this method do not behave like native arrays in some ways
    // i.e. x = []; x[99] = 1; x.length = 100; // native array does this but cloned will lose the ability
    const proto = Object.getPrototypeOf(obj);
    const descs = Object.getOwnPropertyDescriptors(obj);
    clone = Object.create(proto);

    for (const prop in descs) {
      Object.defineProperty(clone, prop, descs[prop]);
    }
  }
  for (const prop in clone) {
    // object like and not null, including array and object
    // because typeof null === 'object'
    if (clone[prop] !== null && typeof clone[prop] === 'object') {
      clone[prop] = deepClone(clone[prop]);
    }
  }
  return clone;
};

export default deepClone;
