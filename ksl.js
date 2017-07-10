var Botkit = require('botkit');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;
var fs = require('fs');
var properties = require ('properties');
var async = require('async');
var sleep = require('sleep');

var url_query;
var childArgs;
var interval;
var sendNotification = false;
var allowNotificationHourStart = 19;
var allowNotificationHourEnd = 20;

var controller = Botkit.slackbot({
  debug: false,
});
var botOptions = {};
var bot;

var itemfile = __dirname + '/items.json';
var items = {};
if (!fs.existsSync(itemfile)) {
  fs.writeFileSync(itemfile, '{}');
}else {
  items = JSON.parse(fs.readFileSync(itemfile, 'utf8'));
}

var newItemsfile = __dirname + '/newItems.json';
var queryFile = __dirname + '/query.json';
var newItems = {};
if (!fs.existsSync(newItemsfile)) {
  fs.writeFileSync(newItemsfile, '{}');
}
else {
  newItems = JSON.parse(fs.readFileSync(newItemsfile, 'utf8'));
}

function sendSlackNotification(item){
  bot.say(
    {
      // text: JSON.stringify(newItems[obj]),
      text: item.title + ' - ' + item.price + ' - ' + item.age + ' - '
      + item.mileage + ' - ' + 'http://www.ksl.com/auto/listing/'+item.data.id,
      channel: 'U2EDZ9C3G' //ylyan
    }
  );
}

function checkToSendNotificationNow(currentHour){
  if(sendNotification
    && currentHour>=allowNotificationHourStart
    && currentHour<=allowNotificationHourEnd){
    return true;
  }
  else {
    return false;
  }
}

function saveNewItemsFile(){
  fs.writeFile(newItemsfile, JSON.stringify(newItems), 'utf8', function(){});
}

function getDateTimeString(){
  var date = new Date();
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function writeLog(msg){
  console.log(getDateTimeString() + ': ' + msg);
}

function checkItems(){
  var currentHour = new Date().getHours();
  writeLog('Checking...');
  // For debug.
  // items = JSON.parse(fs.readFileSync(itemfile, 'utf8'));

  var itemsToNotify = JSON.parse(fs.readFileSync(newItemsfile, 'utf8'));
  if(checkToSendNotificationNow(currentHour)){
    for (var item in itemsToNotify){
      sendSlackNotification(itemsToNotify[item]);
    }
    newItems = {};
    saveNewItemsFile();
  }

  writeLog(childArgs[1]);
  var queries = JSON.parse(fs.readFileSync(queryFile, 'utf8'));

  async.forEachOf(queries, (value, key, callback) => {
    writeLog(key);
    sleep.sleep(3);
}, err => {
    if (err) console.error(err.message);
});
  for (var q in queries){
    writeLog("getting data for: " + q);
    childArgs[1] = queries[q];
    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      var msg = stdout;
      // As of 2018-08-15, there're some TypeError at the beginning of the
      // returned data, need to get rid of it first.
      
      var data = '{'+msg.substring(msg.indexOf("title")-13, msg.length - 2) + '}';
  
      // writeLog(data);
      var objs = JSON.parse(data);
      items = JSON.parse(fs.readFileSync(itemfile, 'utf8'));
      for(var obj in objs){
        if(items[obj] == undefined){
          items[obj] = objs[obj];
          if(checkToSendNotificationNow(currentHour)){
            sendSlackNotification(items[obj]);
          }
          else if (sendNotification) {
            newItems[obj] = objs[obj];
          }
        }
      }
  
      fs.writeFile(itemfile, JSON.stringify(items), 'utf8', function(){
        saveNewItemsFile();
      });
      sendNotification = true;
      writeLog('DONE...');
      // bot.closeRTM();
    });
  }
}

properties.parse ('.properties', { path: true }, function (error, obj){
  if (error) return console.error (error);

  url_query = obj.url;
  childArgs = [
    path.join(__dirname, 'getlist.js'),
    url_query
  ];
  botOptions.token = obj.token;
  bot = controller.spawn(botOptions).startRTM();
  checkItems();
  // interval = setInterval(checkItems, 600000);
});

// clearInterval(interval);
