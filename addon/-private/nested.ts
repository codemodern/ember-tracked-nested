import deepEqual from 'ember-tracked-nested/-private/deep-equal';
import deepClone from 'ember-tracked-nested/-private/deep-clone';
import { get, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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

const handler = function (root: Nested, paths: any[]): ProxyHandler<any> {
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
          root.updateArray(paths, key, arguments);
        };
      }

      // do not recreate a new proxy is already proxy
      if (!value.__isObservedProxy && typeof value === 'object') {
        target[key] = new Proxy(value, handler(root, [...paths, key]));
      }
      return target[key];
    },

    set(target: any, key: PropertyKey, value: any): boolean {
      // if key never existed
      // or if replacement is not the deep equaling original
      // else do nothing
      if (!(key in target) || !deepEqual(target[key], value)) {
        // target[key] = value;
        // trigger update to root
        // we pass root around to each proxy so that it can be notified of changes
        root.update([...paths, key], value);
      }
      return true;
    },
  };
};

class Nested {
  private raw: object;
  private context: any;
  private member: string;
  public data: any;

  constructor(obj: any, context: any, member: string) {
    this.raw = deepClone(obj);
    // @ts-ignore
    this.data = new Proxy(deepClone(this.raw), handler(this, []));
    this.context = context;
    this.member = member;
  }

  public update(paths?: any[], value?: any) {
    // @ts-ignore
    set(this.raw, [...paths].join('.'), value);
    this.triggerTracked();
  }

  public updateArray(paths: string[], method: string | PropertyKey, args: IArguments) {
    // @ts-ignore
    const arrayObj = paths.length > 0 ? get(this.raw, paths.join('.')) : this.raw;
    // @ts-ignore
    arrayObj[method].apply(arrayObj, args);
    this.triggerTracked();
  }

  private triggerTracked() {
    this.data = new Proxy(deepClone(this.raw), handler(this, []));
    if (this.context) {
      set(this.context, this.member, this.data);
    }
  }
}

export function nested(data: any = {}, context: any, member: string) {
  // clone object
  return new Nested(data, context, member);
}

// @ts-ignore
export function trackedNested(target, name, descriptor) {
  const value = descriptor.initializer();
  descriptor.initializer = function () {
    // @ts-ignore
    return nested(value, this, name).data;
  };
  // @ts-ignore
  return tracked(target, name, descriptor);
}
