const assert = require('assert');
const utils = require('../app/utils');

describe('Utils', function() {


  describe('isTimeToAction() - CRON: 16h00 - with a 30min margin', function() {

    it('15h00: start time: should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 0, 0);
      assert.equal(utils.isTimeToAction(cron, now, 30 * 60), false);
    });

    it('15h29: start time: should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 29, 0);
      assert.equal(utils.isTimeToAction(cron, now, 30 * 60), false);
    });

    it('15h30: start time: should return true', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 30, 0);
      assert.equal(utils.isTimeToAction(cron, now, 30 * 60), true);
    });

    it('15h59: start time: should return true', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 59, 0);
      assert.equal(utils.isTimeToAction(cron, now, 30 * 60), true);
    });

    it('16h00: start time: should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 0, 0);
      assert.equal(utils.isTimeToAction(cron, now, -30 * 60), false);
    });


    it('15h45: stop time: should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 15, 45, 0);
      assert.equal(utils.isTimeToAction(cron, now, -30 * 60), false);
    });

    it('16h00: stop time: should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 0, 0);
      assert.equal(utils.isTimeToAction(cron, now, -30 * 60), false);
    });

    it('16h29: stop time: should return true', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 29, 0);
      assert.equal(utils.isTimeToAction(cron, now, -30 * 60), true);
    });

    it('16h30: stop time: should return true', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 30, 0);
      assert.equal(utils.isTimeToAction(cron, now, -30 * 60), true);
    });

    it('16h31 stop time should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 16, 31, 0);
      assert.equal(utils.isTimeToAction(cron, now, -30 * 60), false);
    });

    it('17h00 stop time should return false', function() {
      const cron = "00 16 * * *";
      const now = new Date(2017, 6, 30, 17, 0, 0);
      assert.equal(utils.isTimeToAction(cron, now, -30 * 60), false);
    });

  });


});