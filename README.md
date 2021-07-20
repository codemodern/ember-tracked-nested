ember-tracked-nested [![Build Status](https://travis-ci.com/codemodern/ember-tracked-nested.svg?branch=main)](https://travis-ci.com/codemodern/ember-tracked-nested)
==============================================================================

`nested()` objects/arrays are proxied so that any updates to any nested members are notified at the root object which 
will trigger glimmer's `@tracked`. The `nested()` object are guaranteed to **have the same JSON.stringify output** as original object
as long as it's just a mixture of POJO, array, and primitives, except for Symbol.

`nested()` by itself is not reactive to the rendering, it only works when decorated with `@tracked` or through [autotracking](https://guides.emberjs.com/release/in-depth-topics/autotracking-in-depth/) of the root nested object.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.16 or above
* Ember CLI v3.16 or above
* Node.js v10 or above
* [Proxy](https://caniuse.com/?search=proxy) support

Installation
------------------------------------------------------------------------------

```bash
yarn add ember-tracked-nested
# or
npm add ember-tracked-nested
# or
ember install ember-tracked-nested
```

Usage
------------------------------------------------------------------------------

```js
import { tracked } from '@glimmer/tracking';
import { nested } from 'ember-tracked-nested';
class Foo {
    @tracked obj = nested({ bar: 2 });
}
```

or in a component

```js
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { nested } from 'ember-tracked-nested';
import { action } from '@ember/object';

// works with POJO
export default class Foo extends Component {
  @tracked obj = nested({ bar: 2 });
  
  @action
  changeObj() {
    this.obj.bar = 10;
  }
}

// works when updating nested array
export default class Foo extends Component {
  @tracked obj = nested([{ bar: 2 }, { bar: 4 }]);
  
  @action
  changeObj() {
    this.obj[1].bar = 100;
  }
}

// works with array method
export default class Foo extends Component {
  @tracked obj = nested([{ bar: 2 }, { bar: 4 }]);

  @action
  changeObj() {
    this.obj.push({ bar: 6 });
  }
}

// works with POJO with getter
export default class Foo extends Component {
  @tracked obj = nested({ bar: 2, get foo() { return this.bar } });

  @action
  changeObj() {
    this.obj.bar = 9;
  }
}
```

or autotracked via args

```js
class SomeObj {
  @tracked obj = nested({ a: 1, b: { c: 2 } });
}
```
```html
// passing nested tracked the MyComponent
<MyComponent @obj={{this.someObjInstance.obj}} />

// sample my-component.hbs, printing out the nested value
{{@obj.a}}
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
