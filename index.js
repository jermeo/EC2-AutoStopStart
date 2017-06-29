const AWS = require("aws-sdk");

AWS.config.region = 'us-east-1';

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
      Filters: [ { Name: `tag:auto:stop` } ]
    };

    ec2.describeInstances({}, (error, response) => {
          if (error) {
            reject(error);
          }
          else {

            let instances = [] ;
            response.Reservations.forEach(reservation => reservation.Instances.forEach(instance => {
                instances.push(instance);
            }));

            resolve(instances);
          }

        }
    );

  });

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
      for(const instances of regionInstances) {
        for(const instance of instances) {

            console.log(instance.Tags.find(x => x.Key === 'Name').Value);

        }
      }

    })
    .catch(function(err) {
      console.log(err);
    });

