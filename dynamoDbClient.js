var AWS = require('aws-sdk');

// console.log('process.env', process.env);

var isOffline = function () {
  return process.env.IS_OFFLINE.toLowerCase() === 'true';
};

const options = isOffline() ? {
  region: process.env.REGION,
  endpoint: process.env.ENDPOINT
} : {
  region: process.env.REGION
};

console.log('\r\n\r\n\r\noptions', options);

var dynamodb = {
    doc: new AWS.DynamoDB.DocumentClient(options),
    raw: new AWS.DynamoDB(options)
};

module.exports = dynamodb;
