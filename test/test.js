/* eslint-env mocha */

const assert = require('assert');
const Timer = require('../src/Timer');
const Api = require('../src/Api');

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

describe('Api', () => {
  describe('#constructor', () => {
    it('should return new Api instance', () => {
      const api = new Api();
      assert.ok(api instanceof Api);
    });
  });

  describe('#createUrl', () => {
    it('should create url with https', () => {
      const url = (new Api()).createUrl();
      assert.equal(`https://${Api.BASE_URL}`, url);
    });

    it('should create url without https', () => {
      const url = (new Api({ https: false })).createUrl();
      assert.equal(`http://${Api.BASE_URL}`, url);
    });
  });

  describe('#getToken', () => {
    it('should get token from speedtest website', () => {
      const token = (new Api()).getToken();
      assert.ok(token);
    });
  });
});
