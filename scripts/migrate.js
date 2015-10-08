var _ = require('lodash'),
  fs = require('fs'),
  config = require('../config.json')
  wget = require('wget-improved');

_.forEach(config.corpus, function(d, k){
  var src = config.server+d.q+config.param;
      output = '../app/data/'+k+'.json';

  wget.download(src, '../app/data/autobasic_'+k+'.json')
    .on('end', function(output) {
      console.log( k, output)
      fs.readFile('../app/basic.html','utf8', function (err, data) {
        if (err) throw err;
        fs.writeFile('../app/autobasic_'+k+'.html', data.replace("API", 'autobasic_'+k), function (err) {
          if (err) throw err;
          console.log('html page saved');
        });
      });
    });
});
