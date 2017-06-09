// Read the Phantom webpage '#intro' element text using jQuery and "includeJs"

'use strict';
var page = require('webpage').create();
var system = require('system');

page.onConsoleMessage = function (msg) {
  var obj = JSON.parse(msg);
  var id = obj.data.id;
  console.log('"' + id + '": ' + msg + ',');
  // console.log(msg);
};

page.open(system.args[1], function (status) {
  if (status === 'success') {
    page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js', function () {
      page.evaluate(function () {
        var i=0;
        for (i=1;i<=6;i++){
          var search = '.listing:nth-child('+ i +')';
          $(search).each(function(index){
            console.log();
            var title = $(this).find('.title').text().trim();
            var price = $(this).find('.price').text().trim();
            var mileage = $(this).find('.mileage').text().trim();
            var locatoin = $(this).find('.mileage').next().text().trim().split('|')[0].trim();
            var age ='';
            var data = $(this).attr('data-listing');
            if ($(this).find('.mileage').next().text().trim().split('|')[1] != undefined){
              if ($(this).find('.mileage').next().text().trim().split('|')[1].split(';').length>1)
                age = $(this).find('.mileage').next().text().trim().split('|')[1].split(';')[1].trim();
            }
            console.log('{"title": "' + title +'", "price": "' + price + '", "age": "' + age + '", "mileage": "' + mileage + '", "data": '+ data + '}');
          });
        }

      });

      phantom.exit(0);
    });
  } else {
    phantom.exit(1);
  }
});
