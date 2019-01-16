/* eslint-env mocha */

const assert = require('assert');
const Timer = require('../src/Timer');

describe('Timer', () => {
  describe('#constructor', () => {
    it('should return new Timer instance', () => {
      const timer = new Timer(10000, () => {
      });
      assert.ok(timer instanceof Timer);
    });

    it('should fail if no delay passing', () => {
      assert.throws(() => {
        new Timer(undefined, () => {
        });
      });
    });

    it('should fail if non numeric delay passing', () => {
      assert.throws(() => {
        new Timer('6', () => {
        });
      });
    });

    it('should fail if non function callback passing', () => {
      assert.throws(() => {
        new Timer(3000, 'test');
      });
    });
  });
});
