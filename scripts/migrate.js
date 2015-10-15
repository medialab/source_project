var _ = require('lodash'),
  fs = require('fs'),
  config = require('../config.json')
  wget = require('wget-improved'),
  handlebars = require("handlebars");

_.forEach(config.corpus, function(data, key){

  var req = config.server + data.query + config.param;
      output = '../app/data/'+key+'.json';

  wget
    .download(req, '../app/data/explo_'+ key +'.json')
    .on('end', function(output) {
      console.log(key, output);

        var hbsFile = fs.readFileSync('../app/templates/'+data.template+'.hbs','utf8'),
          template = handlebars.compile(hbsFile),
          result = template({
            title:key,
            json:'explo_'+ key +'.json',
            template:data.template
          });

        fs.writeFile('../app/explo_'+ key +'.html', result, function (err) {
          if (err) throw err;
          console.log('html page saved.');
        });
    });

});


var hbsFile = fs.readFileSync('../app/templates/index.hbs','utf8');
var template = handlebars.compile(hbsFile);
var result = template(config);

fs.writeFileSync('../app/index.html', result);
