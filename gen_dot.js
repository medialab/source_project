#!/usr/bin/env node

var _ = require('lodash');
var fs = require('fs');
var argv = require('yargs').argv;

var timeBegin = 1900,
    timeEnd = 2016,
    filename = 'source'

fs.readFile('app/data/heurist-cache.json', 'utf8', function (err, string) {

  if (err) return console.log(err)
  var data = JSON.parse(string);

  var graph =  {
    organisations:_(data)
      .filter('recordTypeId', 4)
      .forEach(function(o){
        o.hasLink = false;
        if(o.startDate === undefined) o.startDate = timeBegin;
        if(o.endDate === 1970 || o.endDate === undefined) o.endDate = timeEnd-5;
      })
      .value()
      ,
    relations: _(data)
      .filter('recordTypeId', 1)
      .filter(function(r){ return r.typeId !== undefined})
      .filter(function(r){ return r.source.recTypeId === 4 && r.target.recTypeId === 4;})
      .value()
      ,
    issues: _.filter(data,'recordTypeId', 14)
  };

  // console.log(graph.relations);
  // console.log(graph.organisations);
  // console.log(graph.issues);

  // console.log('organisationsTypes:',organisationsTypes);
  // console.log('relationsTypes:',relationsTypes);

  saveDot(graph);

});





function saveDot(graph){
  var graph, graphlight,
      axis = "node [fontsize=24, shape = plaintext]",
      nodes="", keys="", keylinks="", links="";

  // generate axis
  for (var year = timeBegin; year < timeEnd; year++) axis += year + ' -> '
  axis += timeEnd;




  _.forEach(graph.organisations, function(org) {
    nodes += ' '+org.recordId+' [label="'+org.shortName+'"];';
  });

  for (var year = timeBegin; year < timeEnd; year++){
    var res = _(graph.organisations)
      .filter({startDate: year})
      .map('recordId')
      .value()
      .join(" ")
      ;
    nodes += '{ rank = same; '+ year +' '+ res +'    }';
  }

  _.forEach(graph.relations, function(rel) {
    links += ' '+rel.source.id+'->'+rel.target.id+'[label="  '+rel.typeName+'"]';
  });

  nodes = 'subgraph { node [shape=hexagon style=filled, fillcolor=black, color=white fontcolor=white]; edge [penwidth=100]; '+ nodes +'}';
  settings = 'rankdir=LR ';

  graph = 'digraph  {'+ settings + ' ' + axis +'; '+nodes+' '+ links +'}';
  fs.writeFileSync("./"+filename+".dot", graph);
  console.log(filename+".dot saved!");

  // var graphlight = 'digraph  {'+ settings + nodes+' '+ links +'}';
  // fs.writeFileSync("./"+filename+".dot", graphlight);
  // console.log(filename+"-light.dot saved!");
};

