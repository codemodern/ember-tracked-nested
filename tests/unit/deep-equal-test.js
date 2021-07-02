import { module, test } from 'qunit';
import deepEqual from 'ember-tracked-nested/-private/deep-equal';

module('deepEqual()', function () {
  module('Object', () => {
    test('compared nested object correctly', function (assert) {
      const originalObject = { a: 10, b: { c: NaN } };
      const anotherObject = { a: 10, b: { c: NaN } };
      const someOtherObject = { a: 10, b: { c: 11 } };
      const someOtherObjectWithMorePop = { a: 10, b: { c: 11, d: 12 } };
      assert.true(deepEqual(originalObject, anotherObject), `both object is deep-equal`);
      assert.false(deepEqual(originalObject, someOtherObject), `both object is not deep-equal`);
      assert.false(
        deepEqual(someOtherObject, someOtherObjectWithMorePop),
        `both object is not deep-equal if one have more prop`
      );
    });

    test('compare non-nested correctly', function (assert) {
      // compare falsy values
      assert.false(deepEqual(undefined, null));
      assert.false(deepEqual(NaN, null));
      // eslint-disable-next-line qunit/no-assert-equal-boolean
      assert.false(deepEqual(0, false));
      // eslint-disable-next-line qunit/no-assert-equal-boolean
      assert.false(deepEqual(false, ''));

      assert.true(deepEqual(NaN, NaN)); // in pure JS NaN !== NaN
      assert.true(deepEqual(undefined, undefined));
      assert.true(deepEqual(null, null));
      assert.true(deepEqual(0, 0));
      // eslint-disable-next-line qunit/no-assert-equal-boolean
      assert.true(deepEqual(false, false));
      assert.true(deepEqual('', ''));

      // compare truthy
      assert.true(deepEqual({}, {}));
      assert.false(deepEqual({}, []));
      assert.false(deepEqual({ 0: 'a' }, ['a']));
      assert.true(deepEqual([], []));
    });
  });
});
