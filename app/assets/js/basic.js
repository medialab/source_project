// const apiUrl = 'data/heurist-cache-2.json';

console.log(apiUrl)


d3.json(apiUrl, function(error, data) {

  if (error) throw error;

  console.log(data);
  var graph =  {};
  var so = new Source(data);

  console.log(so.getTypes({'recordTypeId':1}))

  var w = 2500, h = 3500,
    color = d3.scale.category20();
    start = so.getTimeBounds().start,
    end = so.getTimeBounds().end,
    rel_offset = 250, relSpacing = 6;

  // list relations
  graph.rel = so.getValidRel();

  graph.linkedNodes = [];

  _.forEach(graph.rel, function(d){
    graph.linkedNodes.push(d.source, d.target);
  });

  graph.linkedNodes = _.uniq(graph.linkedNodes);
  // list administration
  graph.org = _(graph.linkedNodes)
    .filter('recordTypeId', 4)
    .reject('typeId', 5314)
    .sortBy('startDate')
    .value();

  // list states
  graph.sta = _(graph.linkedNodes)
    .filter('typeId', 5314) // states
    // .sortBy('shortName')
    .reverse()
    .value();

  // list documents
  graph.doc = _(graph.linkedNodes)
    .filter('recordTypeId', 13)
    .sortBy('startDate')
    .value();

  // doc index
  graph.docIndex = {};
  graph.doc.forEach(function(d){
    graph.docIndex[d.recordId] = d
  });

  // org index
  graph.orgIndex = {}
  graph.org.forEach(function(d){
    graph.orgIndex[d.recordId] = d
  });

  // rel index
  graph.relIndex = {};
  graph.rel.forEach(function(d){
    graph.relIndex[d.recordId] = d
  });

  // matching tables
  var eventYpos = {};
  // var event

  // states
  var stateOffset = 80,
      stateSpacing = 11;
  graph.sta.forEach(function(d, i){
    eventYpos[d.recordId] = stateOffset + i * stateSpacing
  });

  // documents
  var docOffset = stateOffset + stateSpacing*(graph.sta.length+1),
      docSpacing = 11;

  graph.doc.forEach(function(d, i){
    eventYpos[d.recordId] = docOffset + i * docSpacing
  })

  // organisation
  var org_spacing = 11,
      orgOffset = docOffset + org_spacing*(graph.doc.length+1);

  graph.org.forEach(function(d, i){
    eventYpos[d.recordId] = orgOffset + i * org_spacing
  })

  console.log(graph);

  var svg = d3.select('#basic')
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h)

  // attributes formulas
  function sourceY(d){ return eventYpos[d.source.recordId] }
  function targetY(d){ return eventYpos[d.target.recordId] }
  function relX(d,i){  return rel_offset + i * relSpacing } // index event per target i > (d.startDate-start)
  function relTypeColor(d){return color(_.indexOf(so.getTypes({'recordTypeId':1}), d.typeId));}
  // function @TypeColor(d){return color(_.indexOf(so.getTypes({'recordTypeId':1}), d.typeId));}

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
      .data(graph.org.slice(0).concat(graph.doc).slice(0).concat(graph.sta))

      .enter()
      .append('g')
      .attr('class','listItem')

    list.append('text')
      .attr('x', 20)
      .attr('y', function(d){return eventYpos[d.recordId]})
      .attr('transform', 'translate(0, 4)')
      .text(function(d){return '['+d.typeName +'] '+d.shortName})
      .style('color',relTypeColor)

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
      .data(graph.rel)
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
        return relSpacing < 4 ? 0 : 1
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
    relSpacing = this.value;
    update();
  });

  // draw viz at launch
  create();

})


