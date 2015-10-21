var _ = require('lodash'),
  fs = require('fs'),
  config = require('../config.json')
  wget = require('wget-improved'),
  handlebars = require("handlebars");
  config.date = new Date();

_.forEach(config.corpus, function(data, key){

  var req = config.server + data.query + config.param;
      data.id = key;
      data.json = json = 'explo_'+ key +'.json';

  var hbsFile = fs.readFileSync('../app/templates/'+data.template+'.hbs','utf8'),
    template = handlebars.compile(hbsFile),
    result = template({
      corpus: data,
      id:key,
      update: new Date(),
      config: JSON.stringify({ corpus:data, global:config })
    });

  fs.writeFile('../app/explo_'+ key +'.html', result, function (err) {
    if (err) throw err;
    console.log('html page saved.');
  });

  // wget
  //   .download(req, '../app/data/'+data.json)
  //   .on('end', function(json){ console.log(key, json) });

});


var hbsFile = fs.readFileSync('../app/templates/index.hbs','utf8');
var template = handlebars.compile(hbsFile);
var result = template(config);

fs.writeFileSync('../app/index.html', result);
