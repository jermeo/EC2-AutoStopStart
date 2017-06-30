const AWS = require("aws-sdk");

AWS.config.region = 'eu-west-1';

module.exports = {

  getRegions: () => {

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

  },

  getRegionsInstances: (tag, region, status) => {

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

  },

  getTagValue: (instance, tagName) => {

    let key = instance.Tags.find(x => x.Key === tagName);
    if (key) {
      return key.Value;
    }
    return undefined;

  },

  stopInstances: (region, instanceIds) => {

    const ec2 = new AWS.EC2({
      region: region
    });

    return new Promise((resolve, reject) => {
      ec2.stopInstances({InstanceIds: instanceIds}, (error, response) => {
        if (error) {
          reject(error);
        }
        else {

          resolve(response);
        }
      });
    });
  },

  startInstances: (region, instanceIds) => {

    const ec2 = new AWS.EC2({
      region: region
    });

    return new Promise((resolve, reject) => {
      ec2.startInstances({InstanceIds: instanceIds}, (error, response) => {
        if (error) {
          reject(error);
        }
        else {

          resolve(response);
        }
      });
    });
  },

};