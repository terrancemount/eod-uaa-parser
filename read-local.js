
const fs = require('fs');
const assert = require('assert');

/**
 * Reads JSON from file with given full path file name then deletes the file. If file is not found then nothing is callback / thrown. Arguments:
 *
 * @param {string} fullFileName a string containing the full path file name for the file to read from.
 *
 * @param {function} callback invoked when json read succeeds or fails.  Upon success, callback is invoked with callback(null, json). Upon failure, callback is invoked with callback(err) instead.
 *
 * This function will fail if the json fails to parse with JSON.parse
 *
 *    SyntaxError   JSON fail to parse.
 *
 *  All other failures like file not found errors will be ignorred.  If unable to delete file after parsing then nothing is returned.
 */
module.exports = (fullFileName, callback) => {
  //throw programing errors to crash program.
  assert.equal(typeof (fullFileName), 'string', `${fullFileName} is not a string.`);
  assert.equal(typeof (callback), 'function', 'callback must be a function');

  fs.readFile(fullFileName, (err, data) => {
    //do nothing if err == true;
    if (!err) { //temp file found.

      //try to parse json
      let table;
      try {
        table = JSON.parse(data).table;
      } catch (err) {
        //overwrite bad data if parse failed.
        fs.writeFile(fullFileName, JSON.stringify({ table: [] }), () => { });
        table = [];
      }

      //check if there is data
      if (!table.length) {
        return;
      }

      //write the new blank list to the file.
      fs.writeFile(fullFileName, JSON.stringify({ table: [] }), () => {

        //wait to call back utile the write is done.
        callback(null, table); //success
      });



    }
  });
}
