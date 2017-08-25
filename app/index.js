"use strict";

const awsUtils = require("./aws-utils");
const utils = require("./utils");

/****
 * ----------- PARAMETERS -------------------------------------
 */
const autoStartTag = "auto:start"; // start tag name
const autoStopTag = "auto:stop"; // stop tag name
const dryMode = false; // for testing, if true, never execute action
const margin = 15; // margin time in minutes, depend on the lambda schedule
/****
 * ----------- PARAMETERS -------------------------------------
 */

const keyName = "Name";

exports.handler = (event, context, callback) => {

  utils.log("------- Start -------");

  const now = new Date();

  utils.log(`Now: ${now.toISOString()}`);

  // for all regions
  awsUtils.getRegions()

      .then((regions) => {

        let tabPromise = [];

        // generate promise array for each regions
        for (const region of regions) {
          tabPromise.push(awsUtils.getRegionsInstances({}, region));
        }

        return Promise.all(tabPromise);

      })
      .then((regionInstances) => {

        let tabPromiseStartStop = [];

        // loop over regions
        for (const instances of regionInstances) {

          let startList = [];
          let stopList = [];
          let region;

          // loop over instances
          for (const instance of instances) {

            // check cron tag, status and time to action
            const startCron = awsUtils.getTagValue(instance, autoStartTag);
            const stopCron = awsUtils.getTagValue(instance, autoStopTag);

            if (startCron || stopCron) {

              if (startCron && awsUtils.isStopped(instance) && utils.isTimeToAction(startCron, now, margin * 60)) {

                utils.log(`START needed: ${awsUtils.getRegionFromDNS(instance)}\\${awsUtils.getTagValue(instance, keyName)} - ${instance.InstanceId} - (${stopCron})`);

                startList.push(instance);

              }
              else if (stopCron && awsUtils.isRunning(instance) && utils.isTimeToAction(stopCron, now, -margin * 60)) {

                utils.log(`STOP needed: ${awsUtils.getRegionFromDNS(instance)}\\${awsUtils.getTagValue(instance, keyName)} - ${instance.InstanceId} - (${stopCron})`);

                stopList.push(instance);

              }
              else {

                utils.log(`Nothing to do with: ${awsUtils.getRegionFromDNS(instance)}\\${awsUtils.getTagValue(instance, keyName)} (tag found but no action needed)`);

              }

            }
            else {

              utils.log(`Nothing to do with: ${awsUtils.getRegionFromDNS(instance)}\\${awsUtils.getTagValue(instance, keyName)} (tag not found)`);

            }

          }

          // add action for this region
          if (!dryMode) {

            // action start
            if (startList.length > 0) {
              region = awsUtils.getRegionFromDNS(startList[0]);
              tabPromiseStartStop.push(awsUtils.startInstances(region, startList.map((instance) => {
                return instance.InstanceId;
              })));
            }

            // action stop
            if (stopList.length > 0) {
              region = awsUtils.getRegionFromDNS(stopList[0]);
              tabPromiseStartStop.push(awsUtils.stopInstances(region, stopList.map((instance) => {
                return instance.InstanceId;
              })));
            }
          }

          // next region
        }

        // execute array of promises actions
        return Promise.all(tabPromiseStartStop);

      })

      .then((tabResults) => {

        // display AWS results
        for (const result of tabResults) {
          if (result.StoppingInstances) {
            utils.log("Stopping InstanceId(s):");
            for (const instance of result.StoppingInstances) {
              utils.log(instance.InstanceId);
            }
          }
          if (result.StartingInstances) {
            utils.log("Starting InstanceId(s):");
            for (const instance of result.StartingInstances) {
              utils.log(instance.InstanceId);
            }
          }
        }

      })

      .catch((err) => {
        utils.log("-------------- ERROR -----------------");
        utils.log(err);
        utils.log("-------------- ERROR -----------------");
        callback(err);
      })

      .then(() => {
        utils.log("------- End -------");
        callback(null, "success");
      });

};


