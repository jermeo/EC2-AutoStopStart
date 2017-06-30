"use strict";

const AWS = require("aws-sdk");

//noinspection JSUnusedGlobalSymbols
module.exports = {

  // 0: pending, 16: running, 32: shutting-down, 48: terminated, 64: stopping, 80: stopped
  isRunning: (instance) => {

    return instance.State.Code === 16 ;

  },

  isStopped: (instance) => {

    return instance.State.Code === 80 ;

  },

  getRegions: () => {

    return new Promise((resolve, reject) => {

      AWS.config.update({region: 'eu-west-1'}); //need default region

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

  getRegionsInstances: (filter, region) => {

    return new Promise((resolve, reject) => {

      AWS.config.update({region: region});
      const ec2 = new AWS.EC2();

      ec2.describeInstances(filter, (error, response) => {
            if (error) {
              reject(error);
            }
            else {

              let instances = [];
              response.Reservations.forEach(reservation => reservation.Instances.forEach(instance => {
                if(instance.State.Code !== 48) { // dont keep the terminated
                  instances.push(instance);
                }
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

  getRegionFromDNS: (instance) => {

    return instance.PrivateDnsName.split(".")[1];

  },

  stopInstances: (region, instanceIds) => {

    AWS.config.update({region: region});
    const ec2 = new AWS.EC2();

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

    AWS.config.update({region: region});
    const ec2 = new AWS.EC2();

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