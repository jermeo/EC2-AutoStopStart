const awsUtils = require("./aws-utils");

const autoStartTag = "auto:start";
const autoStopTag = "auto:stop";
const keyName = "Name";

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

      console.log("Start :");
      for (const instance of startList) {
        console.log(awsUtils.getTagValue(instance, keyName));
      }

      console.log("Stop :");
      for (const instance of stopList) {
        console.log(awsUtils.getTagValue(instance, keyName));
      }

    })
    .catch(function(err) {
      console.log(err);
    });