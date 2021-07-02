import { module, test } from 'qunit';
import deepClone from 'ember-tracked-nested/-private/deep-clone';

module('deepClone()', function () {
  module('Object', () => {
    test('clone object is identical with original object', function (assert) {
      const originalObject = { a: 10, b: { c: 10 } };
      const clonedObject = deepClone(originalObject);
      assert.deepEqual(originalObject, clonedObject, `cloned object is identical to original object`);
    });

    test('cloned object have no reference to original object', function (assert) {
      const originalObject = { a: 10, b: { c: 10 } };
      const clonedObject = deepClone(originalObject);
      clonedObject.b.d = 1;
      assert.strictEqual(originalObject.b.d, undefined, 'Original object is not changed');
      assert.strictEqual(clonedObject.b.d, 1, 'Cloned object is changed');
    });
  });
});
