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
  var indexType = ['typeId','typeName','recordTypeId','startDate','recordId'];

  g.indexes = {nodes:{},links:{}};
  g.recTypes = {nodes:{},links:{}};

  _.forEach(indexType, function(d){
    g.indexes.nodes[d] = _.groupBy(g.nodes, d);
    g.indexes.links[d] = _.groupBy(g.links, d);
    g.recTypes.nodes[d] = _(g.nodes).sortBy(d).map(d).uniq().value();
    g.recTypes.links[d] = _(g.links).sortBy(d).map(d).uniq().value();
  });

  var way = ["source","target"];
  // var way = ["target","source"];

  var rank = 0;
  var sorted = _(g.links)
    .groupBy('startDate')
    .forEach(function(g, y){
      _(g)
      .sortBy(function(l){ return l.target.recordId })
      .forEach(function(l,i){
        l.yearRank = rank;
        rank++;
      }).value()
    })
    .value();

  console.log("sorted",sorted)

  g.pathWays = [
    _(g.links).groupBy(function(d){return d[way[0]].recordId}).values().value()
    ,
    _(g.links).groupBy(function(d){return d[way[1]].recordId}).values().value()
  ]

  g.linksPeriod = Sutils.getTimeBounds(g.links)

  draw(g,way);
}

function draw(g,way){

  var w = 2500 , h = 2500, spacingX = 80, spacingY = 20, m = [50, 100];
  var color = d3.scale.category20();
  var svg = d3.select('#pathway').append('svg:svg').attr('width', w).attr('height', h)

  _(g.pathWays).forEach(function(p, entityId){

    console.log(entityId, p)

    function checkPointStartX(d,i){ return m[0] + (d.startDate-g.linksPeriod.start) * spacingX}
    function checkPointEndX(d){ return m[0] + (d.endDate-g.linksPeriod.start) * spacingX}

    function checkPointY(d, i){ return m[1] + _.findIndex(g.nodes, d.target) * spacingY}
    function checkPointY(d, i){ return m[1] + (_.findIndex(g.nodes, d[way[entityId]]) + i) * spacingY}
    function checkPointY(d, i){ return m[1] + (i+entityId) * spacingY}
    function checkPointY(d, i){ return m[1] + d.yearRank * spacingY}


    var line = d3.svg.line()
      .x(checkPointStartX)
      .y(checkPointY)
      .interpolate("monotone");

    var
    entity = svg.selectAll('.entity').data(p)
      .enter().append('g').attr('class','entity');


    entity
      .append('path')
      .attr('d', line)
      .style('stroke-width',entityId ? 3:20)
      .style('fill', 'none')
      // .style('opacity','0.5')
      .style('stroke',"white")
      .style('stroke-linecap', 'round')
      .style('stroke-linejoin', 'round')

    entity
      .append('path')
      .attr('d', line)
      .style('stroke-width',entityId ? 3:17)
      .style('fill', 'none')
      // .style('opacity','0.5')
      .style('stroke', function(d,i){ return color(i) })
      .style('stroke-linecap', 'round')
      .style('stroke-linejoin', 'round')

    entity.append('text')
      .text(function(d,i) { return (entityId ? _.last(d)[way[1]].shortName : _.last(d)[way[0]].shortName) })
      .attr('x', function(d){ return checkPointStartX(_.last(d)) + 10})
      .attr('y', function(d,i){ return checkPointY(_.last(d), d.length-1)})
      .style('font-weight', 'bold')
      .style('fill', function(d,i){ return color(i)})

    var points = entity.selectAll('.checkpoint').data(function(d){return d}).enter();

    points.append('circle')
      .attr('cx', checkPointStartX)
      .attr('cy', checkPointY)
      .attr('r',entityId ? 2:4)
      .style('fill', function(d, i){
        return color(10-_.indexOf(g.recTypes.links['typeId'], d.typeId));
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1)

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
