const awsUtils = require("./aws-utils");
const utils = require("./utils");

const autoStartTag = "auto:start";
const autoStopTag = "auto:stop";
const keyName = "Name";

//for all regions
awsUtils.getRegions()
    .then(function(regions) {

      let tabPromise = [];
      for (const region of regions) {
        tabPromise.push(awsUtils.getRegionsInstances({}, region));
      }

      return Promise.all(tabPromise);

    })
    .then(function(regionInstances) {

      let startList = [];
      let stopList = [];

      for (const instances of regionInstances) {

        for (const instance of instances) {

          if(awsUtils.getTagValue(instance, autoStartTag)) {
            startList.push(instance);
          }
          if(awsUtils.getTagValue(instance, autoStopTag)) {
            stopList.push(instance);
          }

        }

      }

      utils.log("Start :");
      for (const instance of startList) {
        utils.log(awsUtils.getRegionFromDNS(instance) + " - " + awsUtils.getTagValue(instance, keyName));
      }

      utils.log("Stop :");
      for (const instance of stopList) {
        utils.log(awsUtils.getRegionFromDNS(instance) + " - " + awsUtils.getTagValue(instance, keyName));
      }

    })
    .catch(function(err) {
      utils.log(err);
    });