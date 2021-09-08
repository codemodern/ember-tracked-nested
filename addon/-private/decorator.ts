import { tracked } from '@glimmer/tracking';
import { nested } from 'ember-tracked-nested';

// @ts-ignore
export const trackedNested: PropertyDecorator = (...args: any[]) => {
  const [target, key, descriptor] = args;
  return descriptorForField(target, key, descriptor);
};

type DecoratorPropertyDescriptor = PropertyDescriptor & { initializer: any };

function getProxiableValue(value: any, context: any, key: string | number | symbol) {
  return value === undefined || value === null ? value : nested(value, context, key).data;
}

function descriptorForField<T extends object, K extends keyof T>(
  _target: T,
  key: K,
  desc?: DecoratorPropertyDescriptor
): PropertyDescriptor {
  if (desc) {
    const value = desc.initializer;
    desc.initializer = function () {
      const initialValue = value?.call(this);
      return getProxiableValue(initialValue, this, key);
    };
  }

  // @ts-ignore
  const { enumerable, configurable, get, set } = tracked(_target, key, desc);

  return {
    enumerable,
    configurable,

    /* eslint-disable */
    // @ts-ignore
    get(this: T): any {
      return get.call(this);
    },

    // @ts-ignore
    set(this: T, newValue: any): void {
      const proxiedValue = newValue?.__isObservedProxy ? newValue : getProxiableValue(newValue, this, key);
      set.call(this, proxiedValue);
    },
    /* eslint-enable */
  };
}
