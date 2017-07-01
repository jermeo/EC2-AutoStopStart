"use strict";

const parser = require('cron-parser');

module.exports = {

  log: (message) => {

    console.log(new Date().toISOString() + "  " + message);

  },

  isTimeToAction: (cron, now, delaySeconds) => {

    const options = {
      currentDate : now
    };

    const interval = parser.parseExpression(cron, options);

    const dateMargin = new Date(now.getTime());
    dateMargin.setSeconds(dateMargin.getSeconds() + delaySeconds);

    let dateExecution;

    if(delaySeconds>0) {
      dateExecution = interval.next();
      return now.getTime() < dateExecution.getTime() && dateExecution.getTime() <= dateMargin.getTime();
    }
    else {
      dateExecution = interval.prev();
      return dateMargin.getTime() <= dateExecution.getTime() && dateExecution.getTime() < now.getTime();
    }

  },

};