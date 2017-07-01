"use strict";

const AWS = require("aws-sdk");

/****
 * utils wrapper for AWS SDK
 * @type {{isRunning: ((p1:*)), isStopped: ((p1:*)), getRegions: (()), getRegionsInstances: ((p1?:*, p2?:*)),
 * getTagValue: ((p1:*, p2:*)), getRegionFromDNS: ((p1:*)), stopInstances: ((p1?:*, p2?:*)),
 * startInstances: ((p1?:*, p2?:*))}}
 */
//noinspection JSUnusedGlobalSymbols
module.exports = {

  // 0: pending, 16: running, 32: shutting-down, 48: terminated, 64: stopping, 80: stopped


  /**
   * test if instance is in running state
   * @param instance
   * @returns {boolean}
   */
  isRunning: (instance) => {

    return instance.State.Code === 16 ;

  },

  /****
   * test if instance is in stopped state
   * @param instance
   * @returns {boolean}
   */
  isStopped: (instance) => {

    return instance.State.Code === 80 ;

  },

  /***
   * get AWS regions available
   * @returns {Promise}
   */
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

  /**
   * get instances by AWS region (except terminated)
   * @param filter
   * @param region
   * @returns {Promise}
   */
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

  /***
   * get value of an instance tag
   * @param instance
   * @param tagName
   * @returns {undefined}
   */
  getTagValue: (instance, tagName) => {

    let key = instance.Tags.find(x => x.Key === tagName);
    if (key) {
      return key.Value;
    }
    return undefined;

  },

  /***
   * extract the region from a private instance DNS
   * @param instance
   * @returns {*}
   */
  getRegionFromDNS: (instance) => {

    return instance.PrivateDnsName.split(".")[1];

  },

  /**
   * stop the list of instances id for a given region
   * @param region
   * @param instanceIds
   * @returns {Promise}
   */
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

  /**
   * start the list of instances fro a given region
   * @param region
   * @param instanceIds
   * @returns {Promise}
   */
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