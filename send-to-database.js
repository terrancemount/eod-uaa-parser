const request = require('request');
const assert = require('assert');
const VError = require('verror');
const isProd = process.argv.includes('--prod');
const serverUrl = isProd ? process.env.PARSER_SERVER : process.env.PARSER_DEV_SERVER;

/**
 * Send the data to database.
 * @param {JSON} data json to be sent database.
 * @param {function} callback (err, data) err for database, data is the id from the server.
 */
module.exports = (data, callback) => {
  assert.ok(Array.isArray(data), `send-to-database: data is no array`);
  assert.equal(typeof (callback), "function", `send-to-database: callback is not a function`);
  
  //send each packet of json separatly to the server.
  data.forEach(packet => {

    //ugly way of making a clone of packet, but works
    let temp = JSON.parse(JSON.stringify(packet));

    temp['username'] = process.env.SENSOR_BOT_USERNAME || 'foo';
    temp['password'] = process.env.SENSOR_BOT_PASSWORD || 'bar';

    let myPost = request.post({ url: serverUrl, form: temp }, (err, res, body) => {
      if (err) {
        callback(new VError(err, 'send-to-database: request.post error.'));
      } else {
        if (res.statusCode === 200) {
          callback(null, { id: body });
        } else if (res.statusCode === 404) {
          callback(new VError(err, 'send-to-database: 404: Unauthorized.'));
        } else {
          callback(new VError(err, `send-to-database: 500: ${body}`));
        }
      }
    });
  });
}
