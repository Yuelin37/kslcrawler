var request = require("request");

var options = { method: 'POST',
  url: 'https://hooks.slack.com/services/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',
  headers: 
   { 'cache-control': 'no-cache',
     Connection: 'keep-alive',
     'accept-encoding': 'gzip, deflate',
     Accept: '*/*',
     'Content-type': 'application/json' },
  body: '{"text":"Hi, this is node...."}' };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log("done...");
});