/**
 * Mock the json data to be sent to the server.  
 * @param {function(JSON)} callback to be invoked with callback(JSON).
 * 
 * Success callback: Make a json object to be pushed to the server.
 * 
 * Failure: not supported.
 * 
 * based on electricty demand at 180 kwh and naturalgas demand at 900 ccf.
 */

 module.exports = (callback) => {
    
    const ratio = 1 / ((Date.now() - json.datetime) / 1000 / 60 / 60);  

    //check if this is the first time throught the mock.
    if(Date.now == json.datetime){
        callback(json);
        return; // skip the rest of proccesing otherwise.
    }

    json.datetime =  Math.trunc(Date.now() / 1000 / 60) * 60 * 1000;
    json.electrical = json.electrical + 10 * Math.random();
    json.naturalgas = json.naturalgas +  20 * Math.random();
    json.temperature = 40 + 30 * Math.random();
    callback([json]);
 }

 let json = {
    buildingcode: 'test',
    datetime: Date.now(),
    electrical: 100,
    naturalgas: 200,
    temperature: 40
 }