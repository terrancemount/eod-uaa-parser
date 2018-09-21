const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const assert = require('assert');
const VError = require('verror');
const parserConfig = require('./parser-config');

/**
 * Proccess the excel file to json data.
 * @param {string} fullFileName including the path if nessicary.
 * @param {function(err, json)} callback with parameters (error, data)
 */
module.exports = function (fullFileName, callback) {
  assert.equal(typeof (fullFileName), 'string', 'fullFileName must be a string.');
  assert.equal(typeof (callback), 'function', 'callback must be a function.');

  console.log('parse-excel');

  readXlsxFile(fullFileName)
  .then((rows) => {

    //if unable to unlink then invoke callback(err) and end function.
    fs.unlink(fullFileName, (err)=>{
      if(err){
        return callback(new VError(err, 'fs.unlink: "%s"', fullFileName));
      }
    })

    //create json
    let json = {
      buildingcode: null,
      datetime: Math.trunc(Date.now() / 1000 / 60) * 60 * 1000 //round to nearest minute.
    };

    //add more data to json from rows
    rows.forEach(row => {
      const name = parserConfig.getSensorName(row[0]);
      const number = Number.parseFloat(row[4]);

      if(name && number !== NaN && number > 0){
        json[name] = number;

        if(!json.buildingcode){
          json.buildingcode = row[0].split('.', 1)[0];
        }
      }
    });

    //all done, callback
    callback(null, json);
  })
  .catch((err) => {
    callback(new VError(err, 'readXlsxFile: "%s"', fullFileName));
  });
}
