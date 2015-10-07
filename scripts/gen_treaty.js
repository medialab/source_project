#!/usr/bin/env node
var _ = require('lodash'),
  fs = require('fs'),
  argv = require('yargs').argv,
  graphviz = require('graphviz'),
  Source = require('../app/assets/js/source.js');

fs.readFile('../app/data/heurist-cache-2.json', 'utf8', function (err, string) {

  if (err) return console.log(err);

  var data = JSON.parse(string);
  var so = new Source(data);
  var graph =  {};

  // list of elements to link
  graph.allRecordsId = so.getAllRecId();

  // // list relations
  graph.rel = so.getValidRel();

  // list administration
  graph.org = _(data)
    .filter('recordTypeId', 4)
    .reject('typeId', 5314)
    .value()
    ;

  // list states
  graph.sta = _(data)
    .filter('typeId', 5314) // states
    .value()
    ;

  // list documents
  graph.doc = _(data)
    .filter('recordTypeId', 13)
    .value()
  //   ;

  graph.treatys = _(data)
    .where({'typeId':5319})
    .forEach(function(d){
      d.childEvents = so.getTimedLinks(d);
    })
    .value()
    ;

  console.log( so.getTypes({'recordTypeId':1} ));

  _.forEach(graph.treatys,function(t){
      genTreaty(t);
  })

});

function genTreaty(t){

  name = t.shortName;

  var g = graphviz.digraph('source');
  g.set('rankdir','LR');

  g.addNode( t.recordId,{ 'shape':'note','label':t.shortName, 'style':'filled',
        'fillcolor':'black',
        'color':'white',
        'fontcolor':'white',});

  var yprec = t.startDate;
   _.forEach(t.childEvents, function(y, year) {

    var axis = g.addCluster('y_'+year);
        axis.set('rank','same');
        axis.addNode(year, {'shape':'plaintext'});

    _.forEach(y, function(e , key) {
      axis.addNode( e.recordId+'_'+year,{'shape':'invhouse', 'label':e.typeName +' '+ e.target.rec.name});
    })

    g.addEdge( ''+yprec, ''+year );
    yprec = year
   })

  fs.writeFileSync('./exports/'+name+'.dot', g.to_dot());
  g.output( "pdf", './exports/'+name+'.pdf' );
}
