"use strict";

const parser = require('cron-parser');

module.exports = {

  /***********
   *
   * @param message
   */
  log: (message) => {

    // eslint-disable-next-line no-console
    console.log(new Date().toISOString() + "  " + message);

  },

  /*****************
   *
   * @param cron
   * @param now
   * @param marginSeconds
   * @returns {boolean}
   */
  isTimeToAction: (cron, now, marginSeconds) => {

    const options = {
      currentDate: now
    };

    const interval = parser.parseExpression(cron, options);

    const dateMargin = new Date(now.getTime());
    dateMargin.setSeconds(dateMargin.getSeconds() + marginSeconds);

    let dateExecution;



    if (marginSeconds > 0) {
      dateExecution = interval.next();

      // console.log("marginSeconds: " + marginSeconds);
      // console.log("dateExecution: " + dateExecution.toISOString());
      // console.log("now: " + now.toISOString());
      // console.log("dateMargin: " + dateMargin.toISOString());
      // console.log(now.getTime() < dateExecution.getTime());
      // console.log(dateExecution.getTime() <= dateMargin.getTime());

      return now.getTime() < dateExecution.getTime() && dateExecution.getTime() <= dateMargin.getTime();
    }
    else {
      dateExecution = interval.prev();
      return dateMargin.getTime() <= dateExecution.getTime() && dateExecution.getTime() < now.getTime();
    }

  },

};