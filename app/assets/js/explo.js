var config  = {}, graph = {};

d3.json('../config.json', function(error, config){
  graph.conf = config;
  graph.corpus = _(config.corpus)
    .filter(function(value, key) {return key === corpusId;})
    .first();
  d3.json('data/'+graph.corpus.template+'_'+ corpusId +'.json', onData);
});

function onData(error, data) {

  if (error) throw error;

  console.log("\n== data report == \n",Sutils.dataCheck(data),"\n== end ==\n\n");

  var w = 5000, h = 3500,
    color = d3.scale.category10();
    offsetX = 250, spacingX = 10,
    offsetY = 50, spacingY = 12,
    spacingYear = 50,
    eventPosY = {},eventPosX = {};

  // get relations with a source and a target
  graph.links = _(Sutils.getValidLinks(data, graph.conf))
    .reject(graph.corpus.rels.reject || {'all':0} )
    .sortByOrder(graph.corpus.rels.sortBy, graph.corpus.rels.sortOrder)
    .value();
  ;

  // get linked nodes
  graph.nodes = Sutils.getLinkedNodes(data, graph.links);

  // get nodes time bounds
  graph.lines = _(graph.nodes).map(function(n){

    var dates = _(graph.links).filter(function(d){
     return d.target.recordId === n.recordId || d.source.recordId === n.recordId;
    })
    .sortBy('startDates')
    .value();

    return {
      recordId: n.recordId,
      endId:_.last(dates).recordId,
      startId:_.first(dates).recordId
    }

  }).value();

  // get bounds
  graph.linksPeriod = Sutils.getTimeBounds(graph.links),

  // group from config
  graph.corpus.groups.forEach(function(g){
    graph[g.name] = _(graph.nodes)
    .filter(g.filter)
    .reject(g.reject || {'all':0} )
    .sortByOrder(g.sortBy, g.sortOrder)
    .value();
  })

  // get groups names
  graph.groups = graph.corpus.groups;
  graph.groups.forEach(function(g){
    g.offsetY = offsetY;
    graph[g.name].forEach(function(d, i){
      eventPosY[d.recordId] = offsetY + i * spacingY
    });
    offsetY += (graph[g.name].length) * spacingY + spacingY*2;
  });

  // indexes

  graph.linksIndex = _.groupBy(graph.links,'recordId');

  console.log(graph, Sutils.dataCheck(graph.links));

  graph.linkType = Sutils.getTypes(graph.links, {'recordTypeId':1});
  graph.nodeType = Sutils.getTypes(graph.nodes,'',{'recordTypeId':1});

  var svg = d3.select('#explo')
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h)

  // range input event
  d3.select("#zoom").on("input", function() {
    spacingX = this.value;
    update();
  });

  // draw viz at launch
  create();

  // attributes formulas
  function sourceY(d){ return eventPosY[d.source.recordId] }
  function targetY(d){ return eventPosY[d.target.recordId] }
  function linkX(d,i){
    return offsetX + d.rank * spacingX
        // + ((d.startDate - graph.linksPeriod.start) * spacingYear)
  } // index event per target i >
  function linkTypeColor(d){return color(_.indexOf(graph.linkType, d.typeId));}
  function nodeTypeColor(d){return color(_.indexOf(graph.nodeType, d.typeId));}

  // event handlers
  function focusOn(e){

    d3.select(this).style('stroke', 'grey');
    if(e.source){
      d3.select('#l'+e.target.recordId).style('stroke', 'grey');
      d3.select('#l'+e.source.recordId).style('stroke', 'grey');
    }

    d3.selectAll('.node, .edges').filter(function(d, i){
      var testRel = false;
      if(e.recordTypeId === 1) testRel = d.source.recordId === e.source.recordId || d.target.recordId === e.target.recordId
      return ! (d.source.recordId === e.recordId || d.target.recordId === e.recordId || testRel )
    })
    .style('stroke-width',0 )
    .style('opacity', 0.2);

  }
  function focusOff(d){
    d3.select(this).style('stroke', 'white');
    if(d.target){
      d3.select('#l'+d.target.recordId).style('stroke', 'white');
      d3.select('#l'+d.source.recordId).style('stroke', 'white');
    }
    d3.selectAll('.node, .edges').style('opacity', 1)
    d3.selectAll('.edges').style('stroke-width',1);
  }
  function yearLabelOn(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 0.2);
    d3.select(this).transition().style('opacity', 1);
  }
  function yearLabelOff(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 1);
  }

  // create nodes
  function create(){


    var lines = svg.selectAll('.lines')
      .data(graph.lines).enter()
      .append('g')
      .attr('class','line')

      lines.append('line')
        .attr('x1', function(d){ return offsetX + graph.linksIndex[d.startId][0].rank * spacingX})
        .attr('x2', function(d){ return offsetX + graph.linksIndex[d.endId][0].rank * spacingX})

        .attr('y1', function(d){ return eventPosY[d.recordId]})
        .attr('y2', function(d){ return eventPosY[d.recordId]})
        .style('stroke', 'blue')
        .style('stroke-width', 5)
        .style('opacity', .2)
        .attr('id',function(d){ return 'l'+d.recordId } )
        .attr('class','lengthLine' )

  //
  // draw group list
  //
    var list = svg.selectAll('.entities')
      .data(graph.nodes).enter()
      .append('g')
      .attr('class','listItem')

    list.append('text')
      .attr('x', 20)
      .attr('y', function(d){return eventPosY[d.recordId]})
      .attr('transform', 'translate(3, 4)')
      .text(function(d){return _.trunc(d.shortName)})
      .style('fill', nodeTypeColor)
      .append('title')
      .text(function(d) { return d.typeName})

    list.append('line')
      .attr('x1', 100)
      .attr('y1', function(d){return eventPosY[d.recordId]})
      .attr('x2', w)
      .attr('y2', function(d){return eventPosY[d.recordId]})
      .attr('class','axis' )
      .style('stroke', 'white')
      .attr('transform', 'translate(-80)')
      .attr('id',function(d){ return 'l'+d.recordId } )
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);

    list.append('line')
      .attr('x1', offsetX - spacingY)
      .attr('y1', function(d){return eventPosY[d.recordId]})
      .attr('x2', w)
      .attr('y2', function(d){return eventPosY[d.recordId]})
      .style('stroke', 'black')
      .style('opacity', '0.2')
      .attr('id',function(d){ return 'l'+d.recordId } )

    svg.selectAll('.groupLabel')
      .data(graph.groups).enter()
      .append('text')
      .attr('x', 5)
      .attr('y', function(d){return d.offsetY -  spacingY})
      .attr('class', 'groupLabel')
      .text(function(d){ return d.name });

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
      .attr('transform', 'translate(' + 4 + ',' + 0 + ')')
      .attr('text-anchor', 'middle')
      .attr('y', 10)
      .attr('width', 0)
      .on('mouseover', yearLabelOn)
      .on('mouseout', yearLabelOff)

    // year mark
    event.append('line')
      .attr('class', 'yearMark')
      .attr('y1', 0)
      .attr('y2', h)
      .attr('transform', 'translate(' + -10 + ',' + 0 + ')')

      ;
    // edges
    event.append('line')
      .attr('class', 'edges')
      .style('stroke',linkTypeColor)
      .attr('y1', sourceY)
      .attr('y2', targetY)

    // source node
    event.append('circle')
      .attr('class','node source' )
      .attr('cy', sourceY)
      .style('fill',linkTypeColor)
      .attr('r', 5)
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);

    // target node
    event.append('circle')
      .attr('class','node target')
      .attr('cy', targetY)
      .style('fill', linkTypeColor)
      .attr('r', 3)
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);

    update();
  }

  // update attributes
  function update(){

    d3.selectAll('.lengthLine')
      .attr('x1', function(d){ return offsetX + graph.linksIndex[d.startId][0].rank * spacingX})
      .attr('x2', function(d){ return offsetX + graph.linksIndex[d.endId][0].rank * spacingX})

    // year label
    d3.selectAll('.yearLabel')
      .attr('x',linkX)

    // year mark
    d3.selectAll('.yearMark')
      .attr('x1', linkX)
      .attr('x2', linkX)

    // edges
    d3.selectAll('.edges')
      .attr('x1', linkX)
      .attr('x2', linkX)
      .style('stroke-width', function(d){
        return spacingX < 4 ? 0 : 1
      })

    // source node
    d3.selectAll('.source.node')
      .attr('cx', linkX)

    // target node
    d3.selectAll('.target.node')
      .attr('cx', linkX)

  }

}



