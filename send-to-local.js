const fs = require('fs');
const assert = require('assert');
const VError = require('verror');


/**
 * Store json data locally.
 * @param {string}
 * @param {JSON | Array} data to store in local storage at localstore.json
 * @param {function} callback Upon success, callback(null). Upon failure, callback(err).
 */
module.exports = function (fullFileName, data, callback) {
  assert.equal(typeof (callback), 'function', 'callback must be a function.');

  //try to read the file
  fs.readFile(fullFileName, 'utf8', (err, fileData) => {
    if (err) {
      //write a new file
      let obj = { table: data };
      fs.writeFile(fullFileName, JSON.stringify(obj), 'utf8', err => {
        if (err) {
          callback(new VError(err, "send-to-local: Unable to write new file"))
        } else {
          callback(null);
        }
      });
    } else {
      try {
        obj = JSON.parse(fileData);
      } catch (e) {
        obj = { table: [] };
      }
      obj.table.push(...data);
      json = JSON.stringify(obj);
      fs.writeFile(fullFileName, json, 'utf8', err => {
        if (err) {
          callback(new VError(err, "send-to-local: Unable to append json to file."))
        } else {
          callback(null);
        }

      });
    }
  });
}

