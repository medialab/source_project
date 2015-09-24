#!/usr/bin/env node
var _ = require('lodash'),
  fs = require('fs'),
  argv = require('yargs').argv,
  graphviz = require('graphviz'),
  truncate = require('truncate');

fs.readFile('app/data/heurist-cache.json', 'utf8', function (err, string) {

  if (err) return console.log(err)

  var data = JSON.parse(string);
  var graph =  {};

  isTimed = true;
  hasStates = false;

  // list of elements to link
  graph.allRecordsId = _(data)
    .filter(function(d){
     if(!hasStates) return d.typeId !== 5314;
     else return true;
    })
    .map('recordId')
    .value();

  // list relations
  graph.rel = _(data)
    .filter('recordTypeId', 1)
    .filter(function(d){
      return _.includes(graph.allRecordsId, d.target.id) && _.includes(graph.allRecordsId, d.source.id);
    })
    .value()
    ;

  // list administration
  graph.org = _(data)
    .filter('recordTypeId', 4)
    .filter(function(o){
      return  o.typeId !== 5314;// states
    })
    .forEach(function(o){
      if(o.startDate === undefined) o.startDate = timeBegin-1;
      o.shortName = truncate(o.shortName,  30);
    })
    .value()
    ;

  // list states
  graph.sta = _(data)
    .filter('recordTypeId', 4)
    .filter(function(o){ return  o.typeId === 5314;}) // states
    .value()
    ;

  // list documents
  graph.doc = _(data)
    .filter('recordTypeId', 13)
    .forEach(function(o){
      if(o.startDate === undefined) o.startDate = timeBegin-1;
      o.shortName = o.shortTitle;
      o.shortName = truncate(o.shortName,  30);
    })
    .value()
    ;

  // console.log(graph.org);
  // console.log(graph.doc);
  // console.log(graph.rel);
  // console.log(relType);

  var relType = _(graph.rel)
    .sortBy('typeName')
    .map(function(d){return d.typeId+'  : '+d.typeName})
    .uniq()
    .value()
    ;

  genDot2(graph,'source', isTimed, hasStates);
});


function genDot2(graph, name, isTimed, hasStates){

  var timeBegin = 1955,
      timeEnd = 2015;

  var g = graphviz.digraph('source');

  g.set('rankdir','LR');

  var edgeStyle = {
    '5331' : {'color':'goldenrod'}, // applies to
    '5260' : {'penwidth':'2','color':'blue','style':'solid'}, // becomes
    '5150' : {'penwidth':'2','color':'blue','style':'dashed'}, // creates
    '5239' : {}, // implements
    '5335' : {}, // is amended by
    '5151' : {'penwidth':'2','color':'blue','style':'dashed'}, // is created by
    '5177' : {'penwidth':'2','style':'dashed','color':'blue'}, // is integrated in
    '5271' : {'style':'bold','color':'forestgreen'}, // is part of
    '5287' : {'color':'goldenrod'}, // is signed by
    '5184' : {}, // is tabled by
    '5068' : {'penwidth':'2','color':'red'}, // is the legal basis of
    '5161' : {} // is the legal basis of device
  }

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
        'label':d.shortName + ' \n('+d.recordId+')'
      });
  })

  // create documents node
  _.forEach(graph.doc, function(d) {
    g.addNode( d.recordId,
      {
        'shape':'note',
        'label':d.shortName + ' ('+d.recordId+')'
      });
  })

  if(hasStates){
    // create states nodes
    _.forEach(graph.sta, function(d) {
      g.addNode( d.recordId,{'shape':'invhouse', 'label':d.name});
    })
  }

  if(isTimed){

    // add past label in axis
    g.addNode(timeBegin-1, {'label':'past','shape':'plaintext'});

    // Spatialize organisation by year
    for (var y = timeBegin; y < timeEnd+1; y++){

      var axis = g.addCluster('y_'+y);
          axis.set('rank','same');
          axis.addNode(y, {'shape':'plaintext'});

      // Spatialize organisation node
      _(graph.org)
        .filter({startDate: y})
        .value()
        .forEach(function(d){ axis.addNode( d.recordId ) });

      // Spatialize documents node
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
    };

    // add future in axis
    g.addNode(timeEnd+1, {'label':'future','shape':'plaintext'});
    g.addEdge( ''+timeEnd, ''+(timeEnd+1) );
  }

  // create edges
  _.forEach(graph.rel,function(d){
    var edgeOption = _.merge(edgeStyle[d.typeId], {'label':" "+d.typeName  + ' ('+d.recordId+')'});
    g.addEdge(''+d.source.id, ''+d.target.id, edgeOption);
  });

  // write dote file

  var filename = name+(hasStates ? '_states':'')+(isTimed ? '_timed':'');

  fs.writeFileSync('./exports/'+filename+'.dot', g.to_dot());
  g.output( "pdf", './exports/'+filename+'.pdf' );
  console.log(filename+" save !");
}
