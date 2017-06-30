var assert = require('assert');
var utils = require('../app/utils');

describe('Utils', function() {


  describe('isTimeToAction()', function() {

    it('1 - should return true', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 31, 0);
      assert.equal(utils.isTimeToAction(cron, now, 31*60),true);
    });

    it('2 - should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 29, 0);
      assert.equal(utils.isTimeToAction(cron, now, 31*60),false);
    });

    it('3 - should return true', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 30, 0);
      assert.equal(utils.isTimeToAction(cron, now, -31*60),true);
    });

    it('4 - should return true', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 0, 0);
      assert.equal(utils.isTimeToAction(cron, now, -31*60),true);
    });

    it('5 - should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 45, 0);
      assert.equal(utils.isTimeToAction(cron, now, -31*60),false);
    });

    it('6 - should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 31, 0);
      assert.equal(utils.isTimeToAction(cron, now, -31*60),false);
    });

  });


});