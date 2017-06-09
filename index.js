var Crawler = require("crawler");

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("body").text());
        }
        done();
    }
});

// Queue just one URL, with default callback
c.queue('https://www.ksl.com/auto/search?make%5B0%5D=Lexus&miles=25&newUsed%5B0%5D=Used&newUsed%5B1%5D=Certified&drive%5B0%5D=AWD');

// Queue a list of URLs
// c.queue(['http://www.google.com/','http://www.yahoo.com','http://www.adobe.com']);

// Queue URLs with custom callbacks & parameters
// c.queue([{
//     uri: 'http://parishackers.org/',
//     jQuery: false,
//
//     // The global callback won't be called
//     callback: function (error, res, done) {
//         if(error){
//             console.log(error);
//         }else{
//             console.log('Grabbed', res.body.length, 'bytes');
//         }
//         done();
//     }
// }]);

// Queue some HTML code directly without grabbing (mostly for tests)
c.queue([{
    html: '<p>This is a <strong>test</strong></p>'
}]);
