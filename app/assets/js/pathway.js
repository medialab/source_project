var config  = {}, g = {};

d3.json('../config.json', function(error, config){
  g.conf = config;
  g.corpus = _(config.corpus).filter(function(value, key) {return key === corpusId;}).first();
  g.layout = typeof g.corpus.layout !== 'undefined' ? g.corpus.layout : {};
  d3.json('data/'+g.corpus.template+'_'+ corpusId +'.json', onData);
});

function onData (data) {

  g.links = Sutils.getValidLinks(data, g.conf);
  g.nodes = Sutils.getLinkedNodes(data, g.links);

  // indexes and layout overide
  var indexType = ['typeId','typeName','recordTypeId','startDate','recordId'],indexes = {nodes:{},links:{}};

  _.forEach(indexType, function(d){
    indexes.nodes[d] = _.groupBy(g.nodes, d);
    indexes.links[d] = _.groupBy(g.links, d);
  });
  g.pathWays = [
    _(g.links).groupBy(function(d){return d.source.recordId}).values().value()
    // ,_(g.links).groupBy(function(d){return d.target.recordId}).values().value()
  ]

  console.log(g)

  g.linksPeriod = Sutils.getTimeBounds(g.links)

  draw(g);
}



function draw(g){

  var w = 2000 , h = 1500,
      svg = d3.select('#pathway').append('svg:svg').attr('width', w).attr('height', h)


  var spacingX = 80;
  var spacingY = 20;
  var m = [100, 100]


  function checkPointStartX(d){ return m[0] + (d.startDate-g.linksPeriod.start) * spacingX}
  function checkPointEndX(d){ return m[0] + (d.endDate-g.linksPeriod.start) * spacingX}
  function checkPointY(d, i){ return m[1] + _.findIndex(g.nodes, d.target) * spacingY}

  var color = d3.scale.category20();

  var line = d3.svg.line()
  .x(checkPointStartX)
  .y(checkPointY)
  .interpolate("cardinal");

_(g.pathWays).forEach(function(p, pathwayId){

  console.log(pathwayId)
  var pathWay = svg.selectAll('.pathWay').data(p).enter()
    .append('g');


  var path = pathWay
    .append('path')
    .attr('class','pathway')
    .attr('d', line)
    .style('stroke-width',pathwayId ? 3:10)
    .style('fill', 'none')
    .style('stroke', function(d,i){ return color(i) })
    .style('stroke-linecap', 'round')
    .style('stroke-linejoin', 'round')

  pathWay.append('text')
    .style('fill','black')
    .text(function(d,i) { return _.last(d).source.shortName })
    .attr('x', function(d){ return checkPointStartX(_.last(d)) + 10})
    .attr('y', function(d,i){ return checkPointY(_.last(d), d.length-1)})
    .style('fill', function(d,i){ return color(i)})

  var points = pathWay.selectAll('.checkpoint').data(function(d){return d}).enter();

      points.append('line')
      .attr('x1', checkPointStartX)
      .attr('y1', checkPointY)
      .attr('x2', checkPointEndX)
      .attr('y2', checkPointY)
      .style('stroke', '#ccc')


  points.append('circle')
    .attr('cx', checkPointStartX)
    .attr('cy', checkPointY)
    .attr('r',pathwayId ? 2:4)
    .style('fill', 'white')
    .append('title')
    .text(function(d) {
        return  + d.startDate + '\n'
        + d.source.shortName + ' '
        + '\n\t['+ d.typeName + ' — ' + d.typeId + ']\n'
        + '\t\t' + d.target.shortName
        +' ('+d.recordId+')\n—\n[[' + d.title + ']]'
    })


  }).value()


}
