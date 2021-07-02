'use strict';

module.exports = {
  name: require('./package').name,
  included() {
    this._super.included.apply(this, arguments);

    if (this.project.targets.browsers && this.project.targets.browsers.includes('ie 11')) {
      throw new Error(
        '`ember-tracked-nested` uses Proxy, which is not supported in IE 11 or other older browsers. You have included IE 11 in your targets, which is not supported.'
      );
    }
  },
};
