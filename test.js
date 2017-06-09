var obj = {};
obj.fname = 'Hello';
obj.lname = 'World';
console.log(obj);

var fs = require('fs');
console.log(process.cwd());
var itemfile = __dirname + '/items.json';
if (!fs.existsSync(itemfile)) {
  fs.writeFileSync(itemfile, JSON.stringify(obj));
}

var interval = setInterval(function(str1, str2) {
  console.log(str1 + ' ' + str2);
}, 1000, 'Hello.', 'How are you?');
clearInterval(interval);

var properties = require ('properties');

// properties.parse ('.properties', { path: true }, function (error, obj){
//   if (error) return console.error (error);
//   console.log (obj);
//   console.log(obj.url);
//   //{ a: 1, b: 2 }
// });

const { spawn } = require('child_process');
const child = spawn('echo $ANSWER', {
  stdio: 'inherit',
  shell: true,
  env: { ANSWER: 42 },
});
