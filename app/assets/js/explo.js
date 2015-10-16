
config = JSON.parse(config);

d3.json('data/'+config.corpus.json, function(error, data) {

  if (error) throw error;

  console.log(data);
  var graph =  {};

  var w = 2500, h = 3500,
    color = d3.scale.category20();
    start = Sutils.getTimeBounds(data).start,
    end = Sutils.getTimeBounds(data).end,
    linkOffset = 250, linkSpacing = 6;

  // get relations with a source and a target
  graph.links = Sutils.getValidLinks(data);

  // get linked nodes
  graph.nodes = Sutils.getLinkedNodes(data, graph.links);

  // get bounds
  graph.relTimeBounds = Sutils.getTimeBounds(graph.links),

  // get relation type
  graph.relTypes = Sutils.getTypes(data,{'recordTypeId':1});


  // get organisations
  graph.org = _(graph.nodes)
    .filter('recordTypeId', 4)
    .reject('typeId', 5314) // exclude states
    .sortBy('startDate')
    .value();

  // get states
  graph.sta = _(graph.nodes)
    .filter('typeId', 5314)
    .reverse()
    .value();

  // get documents
  graph.doc = _(graph.nodes)
    .filter('recordTypeId', 13)
    .sortBy('startDate')
    .value();

  // get device
  graph.dev = _(graph.nodes)
    .filter('recordTypeId', 16)
    .value();

  // doc index
  graph.docIndex = _.indexBy(graph.doc, 'recordId');

  // org index
  graph.orgIndex = _.indexBy(graph.org, 'recordId');

  // rel index
  graph.relIndex = _.indexBy(graph.rel, 'recordId');

  // matching tables
  var eventYpos = {};
  // var event

  var cats = ['sta','doc','org','dev'];
  var offset = 80;
  var spacing = 11;

  cats.forEach(function(c){
    graph[c].forEach(function(d, i){
      eventYpos[d.recordId] = offset + i * spacing
    });
    offset += (graph[c].length) * spacing + spacing;
  });

  console.log(graph);

  var svg = d3.select('#explo')
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h)

  // attributes formulas
  function sourceY(d){ return eventYpos[d.source.recordId] }
  function targetY(d){ return eventYpos[d.target.recordId] }
  function relX(d,i){  return linkOffset + i * linkSpacing } // index event per target i > (d.startDate-start)
  function relTypeColor(d){return color(_.indexOf(Sutils.getTypes(data,{'recordTypeId':1}), d.typeId));}

  // event handlers
  function focusOn(d){
    d3.select(this).style('stroke', 'red');
    if(d.source){
      d3.select('#l'+d.target.recordId).style('stroke', 'red');
      d3.select('#l'+d.source.recordId).style('stroke', 'red');
    }
  }
  function focusOff(d){
    d3.select(this).style('stroke', 'grey');
    if(d.target){
      d3.select('#l'+d.target.recordId).style('stroke', 'grey');
      d3.select('#l'+d.source.recordId).style('stroke', 'grey');
    }
  }

  // create nodes
  function create(){

  //
  // draw organisations, document and state list
  //
    var list = svg.selectAll('.org')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('class','listItem')

    list.append('text')
      .attr('x', 20)
      .attr('y', function(d){return eventYpos[d.recordId]})
      .attr('transform', 'translate(0, 4)')
      .text(function(d){return d.shortName})
      .style('color',relTypeColor)
      .append('title')
      .text(function(d) { return d.typeName})


    list.append('line')
      .attr('x1', 100)
      .attr('y1', function(d){return eventYpos[d.recordId]})
      .attr('x2', w)
      .attr('y2', function(d){return eventYpos[d.recordId]})
      .attr('class','axis' )
      .style('stroke', 'grey')
      .attr('transform', 'translate(-80)')
      .attr('id',function(d){ return 'l'+d.recordId } )
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);

  //
  // draw events
  //
    var prevDate;
    var event = svg.selectAll('.event')
      .data(graph.links)
      .enter()
      .append('g')
      .attr('id',function(d){ return d.recordId } )
      .attr('class', function(d){
        var isShown = prevDate !== d.startDate;
        prevDate = d.startDate;
        return isShown ? 'event newYear':'event';
      });

    // event title info
    event.append('title')
      .text(function(d) {
        return  + d.startDate + '\n'
        + d.source.shortName + ' '
        + d.typeName + ' '
        + d.target.shortName
        +' ('+d.recordId+')\n—\n[[' + d.title + ']]'

      })

    // year label
    event.append('text')
      .attr('class', 'yearLabel')
      .text(function(d){return d.startDate})
      .attr('text-anchor', 'middle');

    // year mark
    event.append('line')
      .attr('class', 'yearMark')
      .attr('y1', function(d,i){ return 15+ (d.startDate%6) * 10})
      .attr('y2', h)

    // edges
    event.append('line')
      .attr('class', 'edges')
      .style('stroke',relTypeColor)
      .attr('y1', sourceY)
      .attr('y2', targetY)

    // source node
    event.append('circle')
      .attr('class','node source' )
      .attr('cy', sourceY)
      .style('fill',relTypeColor)
      .attr('r', 4)
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);

    // target node
    event.append('circle')
      .attr('class','node target')
      .attr('cy', targetY)
      .style('fill', relTypeColor)
      .attr('r', 4)
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);

    update();
  }

  // update attributes
  function update(){

    // year label
    d3.selectAll('.yearLabel')
      .attr('x',relX)
      .attr('y', function(d,i){ return 10+ (d.startDate%6) * 10})

    // year mark
    d3.selectAll('.yearMark')
      .attr('x1', relX)
      .attr('x2', relX)

    // edges
    d3.selectAll('.edges')
      .attr('x1', relX)
      .attr('x2', relX)
      .style('stroke-width', function(d){
        return linkSpacing < 4 ? 0 : 1
      })

    // source node
    d3.selectAll('.source.node')
      .attr('cx', relX)

    // target node
    d3.selectAll('.target.node')
      .attr('cx', relX)

  }

  // range input event
  d3.select("#zoom").on("input", function() {
    linkSpacing = this.value;
    update();
  });

  // draw viz at launch
  create();

})


