const fs = require('fs');
const csv = require('csv-parser');
const assert = require('assert');
const VError = require('verror');
const parserConfig = require('./parser-config');


/**
 * Open file and proccess out the csv information and callback with JSON data. File will be deleted before callback is invoked.
 * @param {String} fullFilename path to the file.
 * @param {function(err, data)} callback for the data exported to json.
 *
 * Many ways for this to throw and error.
 *
 *  Unlink error: will callback(err) with a wrapped Error for the fs.unlink().
 *
 *  fileNotFound: will callback(err) wrapped Error for fs.readFileStream().
 */
module.exports = function (fullFileName, callback) {
  assert.equal(typeof (fullFileName), 'string', 'fullFileName must be a string.');
  assert.equal(typeof (callback), 'function', 'callback must be a function.');

  let json = {
    buildingcode: null,
    datetime: Math.trunc(Date.now() / 1000 / 60) * 60 * 1000 //round to nearest minute.
    //datetime: cleanTime(Date.now())
  };

  fs.createReadStream(fullFileName)
  .pipe(csv({headers: ['name', 'x', 'x', 'x', 'value', 'x', 'x']}))
  .on('data', (data) => {

    //check to see if building code was set.
    if(!json.buildingcode){
      json.buildingcode = data.name.split('.',1)[0]; //cell A1 needs to contain the building code
    }

    const number = Number.parseFloat(data.value);
    const name = parserConfig.getSensorName(data.name);

    if(name && number !== NaN && number > 0){
      json[name] =  number;
    }

  })
  .on('end', ()=>{
    //try to delete file.
    fs.unlink(fullFileName, (err) => {
      if(!err){
        //file deleted
        callback(null, json);
      }
    })
  })
  .on('error', (err) => {
    callback(new VError(err, 'parse-csv: "%s"', fullFileName));
  });
}
