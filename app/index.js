const awsUtils = require("./aws-utils");
const utils = require("./utils");
const moment = require("moment");

const autoStartTag = "auto:startTest";
const autoStopTag = "auto:stopTest";
const keyName = "Name";

const dryMode = false; // for testing, if true, only display some informations

const now = new Date();

utils.log("------- Start -------");

//for all regions
awsUtils.getRegions()
    .then((regions) => {

      let tabPromise = [];

      //prepare promise array for each regions
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

            if (startCron && awsUtils.isStopped(instance) && utils.isTimeToAction(startCron, now, 31 * 60)) {

              utils.log("Need START: " + awsUtils.getRegionFromDNS(instance) + " (" + instance.InstanceId + ") - " + awsUtils.getTagValue(instance, keyName) + " (" + startCron + ")");
              startList.push(instance);

            }
            else if (stopCron && awsUtils.isRunning(instance) && utils.isTimeToAction(stopCron, now, -31 * 60)) {

              utils.log("Need STOP: " + awsUtils.getRegionFromDNS(instance) + " (" + instance.InstanceId + ") - " + awsUtils.getTagValue(instance, keyName) + " (" + stopCron + ")");
              stopList.push(instance);

            }
            else {
              utils.log("Nothing to do with: " + awsUtils.getRegionFromDNS(instance) + " - " + awsUtils.getTagValue(instance, keyName) + " (tag found but no action needed)");
            }

          }
          else {
            utils.log("Nothing to do with: " + awsUtils.getRegionFromDNS(instance) + " - " + awsUtils.getTagValue(instance, keyName) + " (tag not found)");
          }

        }

        // add action for this region
        if (!dryMode) {

          // action start
          if (startList.length > 0) {
            region = awsUtils.getRegionFromDNS(startList[0]); // todo: find better solution
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

      }

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
      utils.log("ERROR:");
      utils.log(err);
    })
    .then(() => {
      utils.log("------- End -------");
    });


