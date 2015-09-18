#!/usr/bin/env node
var _ = require('lodash'),
  fs = require('fs'),
  argv = require('yargs').argv,
  graphviz = require('graphviz');

var timeBegin = 1955,
    timeEnd = 2015,
    filename = 'source';

fs.readFile('app/data/heurist-cache.json', 'utf8', function (err, string) {

  if (err) return console.log(err)
  var data = JSON.parse(string);

  var graph =  {
    org:_(data)
      .filter('recordTypeId', 4)
      .filter(function(o){
        return  o.typeId !== 5314;
      })
     .filter(function(o){
        return  o.shortName !== "";
      })
      .forEach(function(o){
        o.hasLink = false;
        if(o.startDate === undefined) o.startDate = timeBegin-1;
      })
      .value()
      ,
    rel: _(data)
      .filter('recordTypeId', 1)
      .filter(function(r){ return r.typeId !== undefined
          && r.typeId !== 5091
          && r.typeId !== 5151
          && r.typeId !== 5177
          && r.typeId !== 5261
      })
      .filter(function(r){ return r.source.recTypeId === 4 && r.target.recTypeId === 4;})
      .value()
      ,
    doc:_(data)
      .filter('recordTypeId', 13)
      .forEach(function(o){if(o.startDate === undefined) o.startDate = timeBegin-1;})
      .value()
  };

  // console.log(graph.rel);
  // console.log(graph.org);
  // console.log(graph.doc);

  genDot2(graph);
});


function genDot2(graph){

  var g = graphviz.digraph('source');
  g.set('rankdir','LR');

  // create organisation node
  _.forEach(graph.org, function(d) {
    g.addNode( d.recordId,
      {
        'color' : 'blue',
        'shape':'hexagon',
        'style':'filled',
        'fillcolor':'black',
        'color':'white',
        'fontcolor':'white',
        'label':d.shortName,
      });
  })

  // add past label in axis
  g.addNode(timeBegin-1, {'label':'past','shape':'plaintext'});

  // Spatialize organisation by year
  for (var y = timeBegin; y < timeEnd+1; y++){

    var axis = g.addCluster('y_'+y);
        axis.set('rank','same');
        axis.addNode(y, {'shape':'plaintext'});

    // create organisation node
    _(graph.org)
      .filter({startDate: y})
      .value()
      .forEach(function(d){ axis.addNode( d.recordId ) });

    // create documents node
    _(graph.doc)
      .filter({startDate: y})
      .value()
      .forEach(function(d){
        axis.addNode( d.recordId, {
          'label':d.shortTitle,
          'shape':'note'
        });
      });

    g.addEdge( ''+(y-1), ''+y );
  }

  // add future in axis
  g.addNode(timeEnd+1, {'label':'future','shape':'plaintext'});
  g.addEdge( ''+timeEnd, ''+(timeEnd+1) );

  // write dote file
  fs.writeFileSync('./'+filename+'.dot', g.to_dot());
  console.log(filename+'.dot saved!');

  g.output( "pdf", './'+filename+'.pdf' );

}
