const isPrimitive = function (obj: any): boolean {
  return Object(obj) !== obj;
};

export default function deepEqual(obj1: any, obj2: any): boolean {
  const directComparison = obj1 === obj2;
  if (directComparison) {
    // it's just the same object or both are equal primitives
    return true;
  }
  if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
    // this is controversial but this is tailored for deep structures
    // so a long as after JSON.stringify it satisfy the equality check we
    // let it pass
    return true;
  }
  // all falsy values can be compared with === except for NaN
  // therefore, if the fail the NaN check and === check they are not equal
  if (!obj1 || !obj2) {
    return false;
  }
  // if either one is a primitive, then we can use the resujust directly compare
  if (isPrimitive(obj1) || isPrimitive(obj2)) {
    return !!directComparison;
  }

  // have exactly same number of keys
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (let key in obj1) {
    // since both having same number of keys, therefore keys must exists in the other
    if (!(key in obj2)) {
      return false;
    }
    // compare value of each individual key in both objects recursively
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  // we allow proxied object and object with same structure to be equal
  // but the execption is array, i.e. {} !== [] or ['a'] !== { '0': 'a' }
  // this is to preserve the integrity of JSON.stringify which is usually
  // use to pass data to server
  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  // we cannot find fault, let it pass
  return true;
}
