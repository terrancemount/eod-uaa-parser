const fs = require('fs');
const path = require('path');
const parseCsv = require('./parse-csv');
const parseXlsx = require('./parse-excel');
const parserConfig = require('./parser-config');
const assert = require('assert');
const VError = require('verror');

/**
 * Proccess all the files from the listed in the package.json file retrieved with the parserConfig.getLookupDirName(). Will bundle up all the json in one array.
 * @param {function(err, json[])} callback will be invoked as callback(null, json[]) on success. Will invoke callback(err) with VError wrapped error on failure.
 *
 * Will callback with errors:
 *
 *  readdir error   If readdir can't read the directory, callback for that directory will be invoked.
 */
module.exports = function (callback) {
  assert.equal(typeof (callback), 'function', 'callback must be a function.');

  parserConfig.getLookupDirName().forEach(dir => {
    let output = [];


    fs.readdir(path.normalize(dir), (err, filenames) => {
      if (err) {
        callback(new VError(err, 'parse-directory.js, fs.readdir error: '));
      } else {
        
        let size = filenames.length;
        //loop over array of filenames
        filenames.forEach(filename => {

          let extention = path.extname(filename);

          //select which parser to user for which extention.
          if (extention === '.xlsx') {
            console.log(filename);
            parseXlsx(path.join(dir, filename), (err, json) => {
              if (err) {
                size--; //reduce the size needed because of error.
                callback(new VError(err, 'parse-directory.js, parserXlsx: '));
              } else {

                output.push(json);

                //check if all the filenames have ether errored out or been pushed on the json.
                if (output.length >= size) {
                  callback(null, output);
                }
              }
            });
          } else if (extention === '.csv') {
            parseCsv(path.join(dir, filename), (err, json) => {
              if (err) {
                size--; //reduce the size needed because of error.
                callback(new VError(err, 'parse-directory.js, parseCsv: '));
              } else {

                output.push(json);

                //check if all the filenames have ether errored out or been pushed on the json.
                if (output.length >= size) {
                  callback(null, output);
                }
              }
            });
          } else {
            size--; //reduce the size needed because of error.
            callback(new VError(err, 'parse-directory.js, extension not supported: '));

            //check if all the filenames have ether errored out or been pushed on the json.
            if (size && output.length >= size) {
              callback(null, output);
            }
          }
        });
      }
    });
  })
}
