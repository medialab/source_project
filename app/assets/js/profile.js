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

  g.issues = _(g.nodes).filter('recordTypeId',14).groupBy('category').value();
  g.devices = _(g.nodes).filter('recordTypeId',16).value();




  console.log(g)
  draw(g);
}

function draw(g){

  var w = 3500 , h = 3500, spacingX = 30, spacingY = 12, m = [50, 10];
  var color = d3.scale.category20();
  var svg = d3.select('#pathway').append('svg:svg').attr('width', w).attr('height', h);

}
