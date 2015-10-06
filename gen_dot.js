#!/usr/bin/env node
var _ = require('lodash'),
  fs = require('fs'),
  argv = require('yargs').argv,
  graphviz = require('graphviz'),
  Source = require('./app/assets/js/source.js');

fs.readFile('app/data/heurist-cache.json', 'utf8', function (err, string) {

  if (err) return console.log(err);

  var data = _(JSON.parse(string))
    .reject('typeId', 5314)
    .value()
    ;


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

  // console.log( so.getTypes({'recordTypeId':1} ));

  genDot2(data, graph,'source');

  _.forEach(graph.treatys,function(t){
      genTreaty(t);
  })

  genDot2(data, graph, "S2", so.getTimeBounds().start, so.getTimeBounds().end);

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
  // g.output( "pdf", './exports/'+name+'.pdf' );
}

function genDot2(data, graph, name,timeBegin,timeEnd){

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

  // create states nodes
  _.forEach(graph.sta, function(d) {
    g.addNode( d.recordId,{'shape':'invhouse', 'label':d.name});
  })
  // add past label in axis
  g.addNode(timeBegin-1, {'label':'past','shape':'plaintext'});

  console.log(timeBegin,timeEnd);

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

  // create edges
  _.forEach(graph.rel,function(d){
    var edgeOption = _.merge(edgeStyle[d.typeId], {'label':" "+d.typeName  + ' ('+d.recordId+')'});
    g.addEdge(''+d.source.id, ''+d.target.id, edgeOption);
  });

  // write dote file
  fs.writeFileSync('./exports/'+name+'.dot', g.to_dot());
  g.output( "pdf", './exports/'+name+'.pdf' );
  console.log(name+" save !");
}
