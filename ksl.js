var Botkit = require('botkit');
// var os = require('os');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;
var fs = require('fs');
var properties = require ('properties');
var url_query;
var childArgs;
var interval;
var sendNotification = false;

var controller = Botkit.slackbot({
  debug: false,
});

var bot = controller.spawn({
  token: 'xoxb-128204212119-TY8HT6LHZplkOa0PbyetmlpX'
}).startRTM();

var itemfile = __dirname + '/items.json';
var items = {};
if (!fs.existsSync(itemfile)) {
  fs.writeFileSync(itemfile, '{}');
}else {
  items = JSON.parse(fs.readFileSync(itemfile, 'utf8'));
}

var newItemsfile = __dirname + '/newItems.json';
var newItems = {};
if (!fs.existsSync(newItemsfile)) {
  fs.writeFileSync(newItemsfile, '{}');
}


function checkItems(){
  childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
    console.log('Checking...');
    var msg = stdout;
    var objs = JSON.parse('{'+msg.substring(0, msg.length - 2) + '}');
    for(var obj in objs){
    // console.log(objs[obj]);
      if(items[obj] == undefined){
        items[obj] = objs[obj];
        newItems[obj] = objs[obj];
        if(sendNotification){
          bot.say(
            {
              // text: JSON.stringify(newItems[obj]),
              text: newItems[obj].title + ' - ' + newItems[obj].price + ' - ' + newItems[obj].age + ' - '
              + newItems[obj].mileage + ' - ' + 'http://www.ksl.com/auto/listing/'+newItems[obj].data.id,
              channel: 'U2EDZ9C3G' //ylyan
            }
          );
        }
      }
    }

    fs.writeFile(itemfile, JSON.stringify(items), 'utf8', function(){
      fs.writeFile(newItemsfile, JSON.stringify(newItems), 'utf8', function(){
      });
    });
    sendNotification = true;
    console.log('DONE...');
    // bot.closeRTM();
  });
}

properties.parse ('.properties', { path: true }, function (error, obj){
  if (error) return console.error (error);

  url_query = obj.url;
  childArgs = [
    path.join(__dirname, 'getlist.js'),
    url_query
  ];
  checkItems();
  interval = setInterval(checkItems, 300000);
});

// clearInterval(interval);
