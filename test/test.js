const assert = require('assert');
const Timer = require('../src/Timer');

describe('Timer', function() {
	describe('#constructor', function() {
		it('should return new Timer instance', function() {
			let timer = new Timer(function(){}, 10000);
			assert.ok(timer instanceof Timer);
		});

		it('should fail if no delay passing', function(){

		});

		it('should fail if non numeric delay passing', function(){

		});

		it('should fail if no callback passing', function(){

		});

		it('should fail if non function callback passing', function(){

		});
	});
});
