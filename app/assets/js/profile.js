var config  = {}, g = {};

d3.json('../config.json', function(error, config){
  g.conf = config;
  g.corpus = _(config.corpus).filter(function(value, key) {return key === corpusId;}).first();
  g.layout = typeof g.corpus.layout !== 'undefined' ? g.corpus.layout : {};
  d3.json('data/'+g.corpus.template+'_'+ corpusId +'.json', onData);
});

function onData (data) {

  var data = data.results;

  var l = _.defaults(g.layout, g.conf.layout);

  g.conf.relMerges = typeof g.corpus.relMerges !== 'undefined' ? g.corpus.relMerges : g.conf.relMerges;
  // data = Sutils.mergeNodesFromRelation(data, g.conf, l);

  g.links = Sutils.getValidLinks(data, g.conf, l);
  g.nodes = Sutils.getLinkedNodes(data, g.links, l);

  g.issues = _(g.nodes).filter('recordTypeId',14).sortBy('category').value();
  g.devices = _(g.nodes).filter('recordTypeId',16).sortBy('shortName').value();

  // min-max date
  g.linksPeriod = Sutils.getTimeBounds(g.links)
  g.linksPeriod.end = g.linksPeriod.end+3;

  g.links = _(g.links).forEach(function(d){
    if(_.isUndefined(d.endDate)) d.endDate = g.linksPeriod.end;
    if(d.endDate > 9000) d.endDate = g.linksPeriod.end;
  })
  .filter('typeId', 5158)
  .value()

  g.categories = _(g.issues).indexBy('category').map('category').invert().value()
  g.graphs = _(g.devices).map(function(d){

    var yearDefault = _.map(_.range(0, yearToId(g.linksPeriod.end)), function(i){return { x:i, y:0, y0:0, device:d } });

    var layers = _(g.links)
      .filter(function(l){return l.source.recordId === d.recordId;})
      .sortBy(function(d){ return d.target.category})
      .map(function(l){

        var yearDefault = _.map(_.range(0, yearToId(g.linksPeriod.end)), function(i){return { x:i, y:0, y0:0, device:d, device:d, issue:l.target } });
        var year = []
        for (var i = yearToId(l.endDate); i >= yearToId(l.startDate); i--) {
          year[i] = { x:i, y:1, y0:5, shortName:l.target.shortName }
        };

        return _.defaults(year, yearDefault);
      }).value()
    return { shortName:d.shortName, layers:layers}
  }).value()

  g.maxIssues = _(g.graphs).map(function(d){ return d.layers.length}).max()

  console.log('g.graphs',g);

  draw(g,l)
}

function draw(g,l){

  var width = $("#profile").innerWidth() , height = 2000, m = [120, 50];
  var color = d3.scale.ordinal().range(colorbrewer.Set2[8]);
  var svg = d3.select('#profile').append('svg:svg').attr('width', width).attr('height', height);

  var x = d3.scale.linear()
      .domain([g.linksPeriod.start, g.linksPeriod.end])
      .range([m[0], width-m[0]]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(( g.linksPeriod.end-g.linksPeriod.start)/2)
      .tickFormat(d3.format('04d'))
      .orient("top");

  var stack = d3.layout.stack().offset("silhouette");
  var area = d3.svg.area()
    .x(function(d) { return x(g.linksPeriod.start+d.x) })
    .y0(function(d) { return d.y0 * l.spacingX  })
    .y1(function(d) { return (d.y0 + d.y) * l.spacingX });
  // Draw Stuff



  var device = svg.selectAll('.device').data(g.graphs).enter()
      .append('g')
      .attr('transform', function(d,i){ return 'translate(' + 0 + ',' + ( i * ( l.spacingX * (g.maxIssues+3)) + m[1] )  + ')'});

    device.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', l.spacingX * (g.maxIssues) )
        .attr('class','deviceZone')

    var issue = device.selectAll(".issue")
      .data(function(d,i){
        return i !== 3 ? stack(d.layers) : stack(g.graphs[0].layers)
      })  // record 7 to fix
      .enter()

    var issuePath = issue.append("path")
        .attr("d", area)
        .attr('class','issue')
        .style("fill", function(d) { return _.isUndefined(d[0].issue) ? 'red' : color(g.categories[d[0].issue.category]) })

        issuePath.append('title')
          .text(function(d) {  return _.isUndefined(d[0].issue) ? 'none': d[0].issue.shortName})

        issuePath
          .on('mouseover', function(d){ d3.select(this).attr('opacity', .5)})
          .on('mouseout',  function(d){ d3.select(this).attr('opacity',  1)})

    // issue.append('text')
    //   .text(function(d) {  return _.isUndefined(d[0].issue) ? 'none': d[0].issue.shortName})
    //   .style("fill", function(d) { return _.isUndefined(d[0].issue) ? 'red' : color(g.categories[d[0].issue.category]) })

    device
      .append('text')
      .attr('y', (l.spacingX * g.maxIssues) / 2 )
      .attr('x', 20 )
      .text(function(d){ return d.shortName; }).fill('black')

    device.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + l.spacingX + ")")
      .style('opacity',function(d,i){ return i % 3 === 0 ? 1:0 })
      .call(xAxis);


}

function yearToId(y){ return y - g.linksPeriod.start }

