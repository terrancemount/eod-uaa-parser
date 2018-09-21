const {parsernamelookup, parserlookupdir } = require('./package.json');

/**
 * Object with functions to handle configuration data stored in package.json.
 */
module.exports = {

  /**
   * Gets as sensor name from package.json for the database from the given Siemins name.
   * @param {string} siemenName a string to lookup the sensorname with.
   *
   * No error handleing.  Better give a string and not have package.json messed up.
   */
  getSensorName: (siemensName) => {

    let name = siemensName.split(".");
    name.splice(0, 1);
    name = name.join('.');

    let index = parsernamelookup.findIndex(n => n.siemensname == name);
    if(index > -1){
      return parsernamelookup[index].sensorname;
    }
  },

  /**
   * Get Siemen's name from package.json for a sensor name from database.
   * @param {string} sensorName a string to lookup the Siemens name with.
   *
   * No error handleing.
   */
  getSiemenName: (sensorName) => {
    let index = parsernamelookup.findIndex(n => n.sensorname == sensorName);

    if(index > -1){
      return parsernamelookup[index].siemensname;
    }
  },
  /**
   * Gets the lookup directory array from package.json.
   */
  getLookupDirName: () => {
    return parserlookupdir;
  }
}
