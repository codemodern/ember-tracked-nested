import hbs from 'htmlbars-inline-precompile';
import { render, settled } from '@ember/test-helpers';
import { test } from 'qunit';

export function reactivityTest(desc, Klass) {
  test(desc, async function (assert) {
    let instance;

    class TestComponent extends Klass {
      constructor() {
        super(...arguments);
        instance = this;
      }
    }

    this.owner.register('component:test-component', TestComponent);
    this.owner.register('template:components/test-component', hbs`<div id="test">{{this.value}}</div>`);

    await render(hbs`{{test-component}}`);

    assert.dom('#test').hasText(`${instance.initialValue}`);
    instance.update();
    await settled();
    assert.dom('#test').hasText(`${instance.finalValue}`);
  });
}
