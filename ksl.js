'use strict';
var request = require("request");
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;
writeLog(binPath);
var fs = require('fs');
var properties = require('properties');
// var sleep = require('sleep');

var url_query;
var childArgs;
var interval;
var allowNotificationHourStart = 17;
var allowNotificationHourEnd = 21;

let ts_start = Date.now();

let interval_secs = 600;

var queryFile = __dirname + '/query.json';


function sendMessage(msg) {
  let options = {
    method: 'POST',
    url: 'https://hooks.slack.com/services/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',
    headers:
    {
      'cache-control': 'no-cache',
      Connection: 'keep-alive',
      'accept-encoding': 'gzip, deflate',
      Accept: '*/*',
      'Content-type': 'application/json'
    }
  };
  // writeLog(options.body);
  let body = '{"text":"' + msg + '"}';
  // let body = '{' + msg + '}';
  options.body = body;
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log("Message Sent --- " + msg);
  });
}

function sendSlackNotification(newItemsfile) {
  fs.readFile(newItemsfile, 'utf8', (err, newItemsFileData) => {
    if (err) {
      throw err;
    }
    let newItems = JSON.parse(newItemsFileData);
    for (let item in newItems) {
      sendMessage(newItems[item].title + ' - ' + newItems[item].price + ' - ' + newItems[item].age + ' --- http://www.ksl.com/auto/listing/' + item);
    }

    // Clear newItemsfile
    fs.writeFileSync(newItemsfile, '{}');
  });
}

function checkToSendNotificationNow() {
  var currentHour = new Date().getHours();
  if (currentHour >= allowNotificationHourStart
    && currentHour <= allowNotificationHourEnd) {
    return true;
  }
  else {
    return false;
  }
}

function saveNewItemsFile(newItemsfile, newItems) {

  writeLog("writing: " + newItemsfile);
  writeLog("writing: " + JSON.stringify(newItems));
  fs.writeFile(newItemsfile, JSON.stringify(newItems), 'utf8', () => {
    // writeLog("New Items Saved: " + newItemsfile);
    if (checkToSendNotificationNow()) {
      sendSlackNotification(newItemsfile);
    }
  });
}

function getDateTimeString() {
  var date = new Date();
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function writeLog(msg) {
  console.log(getDateTimeString() + ': ' + msg);
}

function checkItems() {
  writeLog('===============================================');

  // For debug.
  // items = JSON.parse(fs.readFileSync(itemfile, 'utf8'));

  var queries = JSON.parse(fs.readFileSync(queryFile, 'utf8'));

  for (let q in queries) {
    writeLog("Start --- getting data for: " + q);
    childArgs[1] = queries[q];
    childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
      let msg = stdout;
      writeLog(err);
      writeLog(stderr);
      writeLog(msg);
      // As of 2018-08-15, there're some TypeError at the beginning of the
      // returned data, need to get rid of it first.
      let data = '{' + msg.substring(msg.indexOf("title") - 13, msg.length - 2) + '}';

      let objs = JSON.parse(data);

      let itemfile = __dirname + '/items-' + q + '.json';
      let newItemsfile = __dirname + '/newItems-' + q + '.json';
      let foundNewItem = false;

      if (!fs.existsSync(itemfile)) {
        fs.writeFileSync(itemfile, '{}');
      }
      if (!fs.existsSync(newItemsfile)) {
        fs.writeFileSync(newItemsfile, '{}');
      }

      fs.readFile(newItemsfile, 'utf8', (err, newItemsFileData) => {
        if (err) {
          throw err;
        }
        // writeLog(newItemsfile + " loaded");
        fs.readFile(itemfile, 'utf8', (err, data) => {
          if (err) {
            throw err;
          }
          // writeLog(itemfile + " loaded");
          // writeLog(data);
          let items = JSON.parse(data);
          let newItems = JSON.parse(newItemsFileData);
          for (let obj in objs) {
            if (items[obj] == undefined) {
              items[obj] = objs[obj];
              newItems[obj] = objs[obj];
              foundNewItem = true;
            }
          }

          fs.writeFile(itemfile, JSON.stringify(items), 'utf8', function () {
            writeLog('Done --- getting data for: ' + q);
          });
          if (foundNewItem && (Date.now() - ts_start > interval_secs * 1000)) {
            saveNewItemsFile(newItemsfile, newItems);
          }
        });
      });
    });
  }
}

properties.parse('.properties', { path: true }, function (error, obj) {
  if (error) return console.error(error);

  url_query = obj.url;
  childArgs = [
    path.join(__dirname, 'getlist.js'),
    url_query
  ];
  checkItems();
  interval = setInterval(checkItems, interval_secs * 1000);
});

// clearInterval(interval);
