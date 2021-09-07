import { DEBUG } from '@glimmer/env';
import { trackedData } from '@glimmer/validator';
import { nested } from 'ember-tracked-nested';

// @ts-ignore
export const trackedNested: PropertyDecorator = (...args: any[]) => {
  const [target, key, descriptor] = args;

  // Error on `@trackedNested()`, `@trackedNested(...args)`, and `@trackedNested get propName()`
  if (DEBUG && typeof target === 'string') throwTrackedWithArgumentsError(args);
  if (DEBUG && target === undefined) throwTrackedWithEmptyArgumentsError();
  if (DEBUG && descriptor && descriptor.get) throwTrackedComputedPropertyError();

  if (descriptor) {
    return descriptorForField(target, key, descriptor);
  }
  // In TypeScript's implementation, decorators on simple class fields do not
  // receive a descriptor, so we define the property on the target directly.
  Object.defineProperty(target, key, descriptorForField(target, key));
};

function throwTrackedComputedPropertyError(): never {
  throw new Error(
    `The @trackedNested decorator does not need to be applied to getters. Properties implemented using a getter will recompute automatically when any tracked properties they access change.`
  );
}

function throwTrackedWithArgumentsError(args: unknown[]): never {
  throw new Error(
    `You attempted to use @trackedNested with ${args.length > 1 ? 'arguments' : 'an argument'} ( @trackedNested(${args
      .map((d) => `'${d}'`)
      .join(
        ', '
      )}) ), which is no longer necessary nor supported. Dependencies are now automatically tracked, so you can just use ${'`@trackedNested`'}.`
  );
}

function throwTrackedWithEmptyArgumentsError(): never {
  throw new Error(
    'You attempted to use @trackedNested(), which is no longer necessary nor supported. Remove the parentheses and you will be good to go!'
  );
}

function getProxiableValue(value: any, context: any, key: string | number | symbol) {
  return value === undefined || value === null ? value : nested(value, context, key).data;
}

/**
 * Whenever a trackedNested computed property is entered, the current tracker is
 * saved off and a new tracker is replaced.
 *
 * Any trackedNested properties consumed are added to the current tracker.
 *
 * When a trackedNested computed property is exited, the tracker's tags are
 * combined and added to the parent tracker.
 *
 * The consequence is that each trackedNested computed property has a tag
 * that corresponds to the trackedNested properties consumed inside of
 * itself, including child trackedNested computed properties.
 */
type DecoratorPropertyDescriptor = (PropertyDescriptor & { initializer?: any }) | undefined;

function descriptorForField<T extends object, K extends keyof T>(
  _target: T,
  key: K,
  desc?: DecoratorPropertyDescriptor
): PropertyDescriptor {
  if (DEBUG && desc && (desc.value || desc.get || desc.set)) {
    throw new Error(
      `You attempted to use @trackedNested on ${key}, but that element is not a class field. @trackedNested is only usable on class fields. Native getters and setters will autotrack add any tracked fields they encounter, so there is no need mark getters and setters with @trackedNested.`
    );
  }

  if (desc) {
    const value = desc.initializer;
    desc.initializer = function () {
      const initialValue = value?.call(this);
      return getProxiableValue(initialValue, this, key);
    };
  }

  const { getter, setter } = trackedData<T, K>(key, desc && desc.initializer);

  return {
    enumerable: true,
    configurable: true,

    /* eslint-disable */
    // @ts-ignore
    get(this: T): any {
      return getter(this);
    },

    // @ts-ignore
    set(this: T, newValue: any): void {
      const proxiedValue = newValue?.__isObservedProxy ? newValue : getProxiableValue(newValue, this, key);
      setter(this, proxiedValue);
    },
    /* eslint-enable */
  };
}
