import { tracked } from '@glimmer/tracking';
import deepEqual from 'ember-tracked-nested/-private/deep-equal';
import deepClone from 'ember-tracked-nested/-private/deep-clone';

// these methods modifies array in-place
const ARRAY_MODIFIER_GETTER_METHODS = new Set<string | PropertyKey>([
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
]);

const handler = function (root: Nested): ProxyHandler<any> {
  return {
    get(target: any, key: PropertyKey): any {
      // this is how we know something is already proxified
      if (key === '__isObservedProxy') {
        return true;
      }

      const value: any = target[key];

      // return if property not found
      if (value === undefined) {
        return;
      }
      // if any in place modification took place in arrays
      // return a wrapping function that will fire the method and then update the root
      if (Array.isArray(target) && ARRAY_MODIFIER_GETTER_METHODS.has(key)) {
        return function () {
          value.apply(target, arguments);
          root.update();
        };
      }

      // do not recreate a new proxy is already proxy
      if (!value.__isObservedProxy && typeof value === 'object') {
        target[key] = new Proxy(value, handler(root));
      }
      return target[key];
    },

    set(target: any, key: PropertyKey, value: any): boolean {
      // if key never existed
      // or if replacement is not the deep equaling original
      // else do nothing
      if (!(key in target) || !deepEqual(target[key], value)) {
        target[key] = value;
        // trigger update to root
        // we pass root around to each proxy so that it can be notified of changes
        root.update();
      }
      return true;
    },
  };
};

class Nested {
  @tracked data: any;

  constructor(obj: any) {
    const clone = deepClone(obj);
    this.data = new Proxy(clone, handler(this));
  }

  update() {
    // triggers root and all nested child listeners
    // eslint-disable-next-line no-self-assign
    this.data = this.data;
  }
}

export default function (data: any = {}) {
  // clone object
  return new Nested(data).data;
}
