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

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log('Read Directory Failed: ', err);
      callback(err);
    } else {
      //create new array variable assign to a call to map on the files array
      var todoList = _.map(files, (file) => {
        //at each element...
        //slice the first 5 characters from the string
        var fileId = file.slice(0, 5);
        //create an object with id and text properties, value should be 5 char string created above
        return { id: fileId, text: fileId };
      });
      //call callback on null, new array
      callback(null, todoList);
    }
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
      console.log('No file with that id!', err);
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
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
