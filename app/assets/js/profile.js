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

  g.links = Sutils.getValidLinks(data, g.conf, l);
  g.nodes = Sutils.getLinkedNodes(data, g.links, l);

  g.issues = _(g.nodes).filter('recordTypeId',14).sortBy('category').value();
  g.devices = _(g.nodes).filter('recordTypeId',16).value();

  // min-max date
  g.linksPeriod = Sutils.getTimeBounds(g.links)

  g.links = _(g.links).forEach(function(d){
    if(_.isUndefined(d.endDate)) d.endDate = g.linksPeriod.end;
    if(d.endDate > 9000) d.endDate = g.linksPeriod.end;
  })
  .filter('typeId', 5158)
  .value()

  g.categories = _(g.issues).indexBy('category').map('category').invert().value()
  g.graphs = _(g.devices).map(function(d){

    var yearDefault = _.map(_.range(0, yearToId(g.linksPeriod.end)), function(i){return { x:i, y:0.1, y0:0.1, device:d } });

    var layers = _(g.links)
      .filter(function(l){return l.source.recordId === d.recordId;})
      .sortBy('category')
      .map(function(l){
        var year = []
        for (var i = yearToId(l.endDate); i >= yearToId(l.startDate); i--) {
          year[i] = { x:i, y:1, y0:1, shortName:l.target.shortName, device:d, issue:l.target }
        };
        return  _.defaults(year, yearDefault);
      }).value()

    return { shortName:d.shortName, layers:layers}
  }).value()

  console.log('g.graphs',g)
  draw(g);
}

function draw(g){

  var width = 1500 , height = 1500, spacingX = 30, spacingY = 12, m = [50, 10];
  var color = d3.scale.category20();
  var svg = d3.select('#profile').append('svg:svg').attr('width', width).attr('height', height);

  stack = d3.layout.stack().offset("silhouette");
  layer = stack(g.graphs[2].layers);

  var area = d3.svg.area()
    .x(function(d) { return d.x * 50 })
    .y0(function(d) { return d.y0 *10  })
    .y1(function(d) { return (d.y0 + d.y) *10 });

  var device = svg.selectAll('.device').data(g.graphs).enter()
    .append('g')
    .attr('transform', function(d,i){ return 'translate(' + 0 + ',' + i*100 + ')'});

    device.append('text')
    .text(function(d){
      return d.shortName;
    }).fill('black')

  device.selectAll("path")
      .data(function(d,i){
        if(i < 7) return stack(d.layers)
        return layer
      })
    .enter().append("path")
      .attr("d", area)
      .style("fill", function(d) {
        if(d[0].issue) console.log(d, g.categories[d[0].issue.category] );
        return color(Math.random());
      });

}
function yearToId(y){ return y - g.linksPeriod.start }
