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

    const date1 = new Date(now.getTime());
    date1.setSeconds(date1.getSeconds() + delaySeconds);
    let date2;


    if(delaySeconds>0) {
      date2 = interval.next();
      // console.log(now.toISOString());
      // console.log(date2.toISOString());
      // console.log(date1.toISOString());
      return now.getTime() < date2.getTime() && date2.getTime() < date1.getTime();
    }
    else {
      date2 = interval.prev();
      console.log(now.toISOString());
      console.log(date2.toISOString());
      console.log(date1.toISOString());
      return date1.getTime() < date2.getTime() && date2.getTime() < now.getTime();
    }

  },

};