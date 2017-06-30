const AWS = require("aws-sdk");

AWS.config.region = 'eu-west-1';

const autoStartTag = "auto:start";
const autoStopTag = "auto:stop";
const keyName = "Name";

const getRegions = () => {

  return new Promise((resolve, reject) => {

    const ec2 = new AWS.EC2();

    ec2.describeRegions({}, (error, response) => {
          if (error) {
            reject(error);
          }
          else {
            resolve(response.Regions.map((reg) => {
              return reg.RegionName;
            }));
          }
        }
    );

  });

};

const getRegionsInstances = (tag, region, status) => {

  return new Promise((resolve, reject) => {

    const ec2 = new AWS.EC2({
      region: region
    });

    const params = {
      Filters: [{Name: `tag:auto:stop`}]
    };

    ec2.describeInstances({}, (error, response) => {
          if (error) {
            reject(error);
          }
          else {

            let instances = [];
            response.Reservations.forEach(reservation => reservation.Instances.forEach(instance => {
              instances.push(instance);
            }));

            resolve(instances);
          }

        }
    );

  });

};

const getTagValue = (instance, tagName) => {

  let key = instance.Tags.find(x => x.Key === tagName);
  if (key) {
    return key.Value;
  }
  return undefined;

};

getRegions()
    .then(function(regions) {

      let tabPromise = [];
      for (const region of regions) {
        tabPromise.push(getRegionsInstances({}, region));
      }

      return Promise.all(tabPromise);
    })
    .then(function(regionInstances) {

      let startList = [];
      let stopList = [];

      for (const instances of regionInstances) {
        for (const instance of instances) {

          if(getTagValue(instance, autoStartTag)) {
            startList.push(instance);
          }
          if(getTagValue(instance, autoStopTag)) {
            stopList.push(instance);
          }

        }
      }

      console.log("Start :");
      for (const instance of startList) {
        console.log(getTagValue(instance, keyName));
      }

      console.log("Stop :");
      for (const instance of stopList) {
        console.log(getTagValue(instance, keyName));
      }

    })
    .catch(function(err) {
      console.log(err);
    });

