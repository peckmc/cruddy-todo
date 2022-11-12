const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  // get the next unique id
  counter.getNextUniqueId((err, id) => {
    if (err) {
      callback(err);
    } else {
      // use that id to generate a file in the data directory folder
      // write our text to the new file by making a call to fs.writeFile
      var myPath = exports.dataDir + '/' + id + '.txt';
      fs.writeFile(myPath, text, (err) => {
        if (err) {
          console.log('error: ', err);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};


exports.readAll = (callback) => {

  //compile a list of todo items (array) by visiting each file in the data directory
  // original: [ '00001.txt', '00002.txt' ]
  // expected: [{ id: '00001', text: '00001' }, { id: '00002', text: '00002' }]

  new Promise(function (resolve, reject) {
    fs.readdir(exports.dataDir, (err, files) => {
      if (err) {
        console.log('Read Directory Failed: ', err);
        reject(err);
      } else {
        resolve(files)
        //iterate through files array
        var filePromises = [];
        _.map(files, (currentFileName) => {
          var myPath = path.join(exports.dataDir, currentFileName);
          var promise = new Promise(function (resolve, reject) {
            fs.readFile(myPath, 'utf8', (err, data) => {
              if (err) {
                reject(err);
              } else {
                var fileId = currentFileName.slice(0, 5);
                //create an object with id and text properties, value should be 5 char string created above
                var currentItem = { id: fileId, text: data };
                resolve(currentItem);
              }
            })
          });
          filePromises.push(promise);
        });
      };
    Promise.all(filePromises)
      .then((todoList) => {
        callback(null, todoList)
      })
      .catch((err) => { callback(err) });
    });
  });
};


exports.readOne = (id, callback) => {
  // refactor the readOne to read a todo item from the dataDir based on the message's id.
  // For this function, you must read the contents of the todo item file and respond with it to the client.

  // create path to file with input id name using path.join
  var endpoint = id + '.txt';
  var currentPath = path.join(exports.dataDir, endpoint);
  // make a call to fs.readfile, passing in the path variable and a callback
  // first parameter of callback is an error
  // second parameter is data
  // handle the error
  fs.readFile(currentPath, 'utf8', (err, data) => {
    if (err) {
      callback(err);
      // on success
      // create an object with two properties: first property is the id, second property key is text, value is data
    } else {
      var currentTodo = { id, text: data };
      callback(null, currentTodo);
    }
  });
};

exports.update = (id, text, callback) => {
  //refactor the update function to rewrite the todo item stored in the dataDir based on its id
  //create a path to the file with the input id, using path.join
  var endpoint = id + '.txt';
  var currentPath = path.join(exports.dataDir, endpoint);
  //check current path to see if file exists
  fs.readFile(currentPath, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(currentPath, text, (err) => {
        if (err) {
          callback(err);
        } else {
          //on success...
          //call the callback, passing in null and text
          callback(null, text);
        }
      });
    }
  })
};


exports.delete = (id, callback) => {
  //refactor the delete function to remove the todo file stored in the dataDir based on the supplied id
  //create the path
  var endpoint = id + '.txt';
  var currentPath = path.join(exports.dataDir, endpoint);
  //call fs.unlink, passing in the path and a callback, which takes in an error
  fs.unlink(currentPath, (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
