require('dotenv').config({ path: __dirname + '/.env' })
const parseDirectory = require('./parse-directory');
const sendToDatabase = require('./send-to-database');
const sendToLocal = require('./send-to-local');
const readLocal = require('./read-local');
const path = require('path');
const fullFileName = path.join(__dirname, `localstore.json`);
const VError = require('verror');
const mock = require('./parse-mock');
let isServerUp = true;

const isMock = process.argv.includes('--mock');



/**
 * Setup an interval to call parseLoop every minute. Look at parseLoop for explanation.
 */
setInterval(() => {
  if(isMock) {
    mockloop();
  } else {
    parseLoop();
  }
}, 60 * 1000);

/**
 * This will execute the parseLoop immediatly after starting the
 * node project rather than waiting for interval. also will start mock if mocking the server imicatley
 */
if(isMock){
  mockloop();
} else {
  parseLoop();
}



/**
 * Main Loop for the parser.
 * Steps:
 * 1) look for new csv and xlsx files in directories listed in the package.json under
 */
function parseLoop() {

  //parse the new stuff first (should only be one file for each building being tracked.)
  parseDirectory((err, newJson) => {
    if (err) {
      handelError(new VError(err, "parseLoop.parseDirectory =>"));
    } else {
      proccessJson(newJson, (err, res) => {

        //side effect every time send to server is tried, it sets the isServerUp varable.
        if (err) {
          handelError(new VError(err, `parseLoop: parseDirectory: proccessJson: ~ new file ~ => `));
        } else {
          console.log(`New json res:`, res);
        }
      });
    }
  });

  //wait 5 seconds to make sure the isServerUp boolean is valid.  (call to proccessJson is almost done.)
  setTimeout(() => {
    //now check if the is is up from the last call to proccessJson.
    readLocal(fullFileName, (err, oldJson) => {
      if (err) {
        handelError(new VError(err, `parserLoop: parseDirectory: readLocal(${fullFileName} => `));
      } else { //make sure there is json.
        proccessJson(oldJson, (err, res) => {
          if (err) {
            handelError(new VError(err, `parserLoop: parseDirectory: readLocal(${fullFileName}: proccesJson: ~ old data after isServerUp = ${isServerUp} => `));
          } else {
            console.log('Old json res: ', res);
          }
        });
      }
    })
  }, 5000);
}

function proccessJson(json, callback) {

  //send to database with an explode on each element of the json array.
  sendToDatabase(json, (err, res) => {
    if (err) {
      isServerUp = false; //side effect of calling proccessJson. Uses to know if localread is useful.
      callback(new VError(err, 'Unable to sendToDatabase: '))
    } else {
      isServerUp = true; //server is up then make sure no local storage.
      callback(null, res);
    }
  });

  //wait 5 seconds for isServerUp to be set then check if it needs to be sent to local storage.
  setTimeout(() => {
    if (!isServerUp) {
      sendToLocal(fullFileName, json, err => {
        if (err) {
          callback(new VError(err, 'sendToLocal unable to save json:'));
        } //else do nothing, data is saved to local storage
      });
    }
  }, 5000)

}

/**
 * writes mock data to the server.
 */
function mockloop(){
  mock((data) => {
    sendToDatabase(data, (err, res) => {
      if(err){
        console.log(err);
      } else {
        console.log("res: ", res);
      }
    });
  });


}

/**
 * Error handeler for all parser functions.
 * @param {JSON} error message to log to server.
 */
function handelError(error) {
  //console.log(error.message);
}