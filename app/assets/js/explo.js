var config  = {}, g = {};

d3.json('../config.json', function(error, config){
  g.conf = config;
  g.corpus = _(config.corpus)
    .filter(function(value, key) {return key === corpusId;})
    .first();

  g.layout = typeof g.corpus.layout !== 'undefined' ? g.corpus.layout : {};
  d3.json('data/'+g.corpus.template+'_'+ corpusId +'.json', onData);
});

function onData(error, data) {

  var colors = [d3.scale.category20(), d3.scale.ordinal().range(Sutils.colors[1])],
      eventPosY = {}, eventPosX = {},
      l = _.defaults(g.layout, g.conf.layout);

  console.log('\n== data report == \n',Sutils.dataCheck(data),'\n== end ==\n\n');
  g.conf.relMerges = typeof g.corpus.relMerges !== 'undefined' ? g.corpus.relMerges : g.conf.relMerges;

  // get relations with a source and a target
  g.links = _(Sutils.getValidLinks(data, g.conf))
    .filter(function(d){return g.corpus.rels.reject ? Sutils.multiValueFilter(d, g.corpus.rels.reject, false) : true})
    .sortByOrder(g.corpus.rels.sortBy, g.corpus.rels.sortOrder)
    .value();

  // get linked nodes
  g.nodes = Sutils.getLinkedNodes(data, g.links);

  // get nodes time bounds
  g.nodeTimelines = Sutils.getNodeLines(g.nodes, g.links)

  // get bounds
  g.linksPeriod = Sutils.getTimeBounds(g.links),

  // group from config
  g.corpus.groups.forEach(function(group){
    g[group.name] = _(g.nodes)
    .filter(group.filter)
    .reject(group.reject || {'all':0} )
    .sortByOrder(group.sortBy, group.sortOrder)
    .value();
  })

  // get groups names
  g.groups = g.corpus.groups;
  g.groups.forEach(function(group){
    group.offsetY = l.offsetY;
    g[group.name].forEach(function(d, i){ eventPosY[d.recordId] = l.offsetY + i * l.spacingY});
    l.offsetY += (g[group.name].length) * l.spacingY + l.spacingY*2;
  });

  // indexes and layout overide
  var indexType = ['typeId','typeName','recordTypeId','startDate','recordId'],
      indexes = {nodes:{},links:{}},
      recTypes = {nodes:{},links:{}};

  _.forEach(indexType, function(d){
    indexes.nodes[d] = _.indexBy(g.nodes, d);
    indexes.links[d] = _.indexBy(g.links, d);
    recTypes.nodes[d] = _(g.nodes).sortBy(d).map(d).uniq().value();
    recTypes.links[d] = _(g.links).sortBy(d).map(d).uniq().value();
  })

  var layout = {nodes:{},links: _(g.links).indexBy('typeId').value()}

  _(g.corpus.rels.layouts).forEach(function(customLayout){
    customLayout.typeIds.forEach(function(id){
      layout.links[id] = customLayout.layout;
    })
  }).value()

  // attributes formulas
  function sourceY(d){ return eventPosY[d.source.recordId] }
  function targetY(d){ return eventPosY[d.target.recordId] }
  function linkX(d,i){ return l.offsetX + d.rank * l.spacingX }// + ((d.startDate - g.linksPeriod.start) * l.spacingYear)
  function linkColor(d){ return colors[0](_.indexOf(recTypes.links[l.colorBy.link], d[l.colorBy.link])) }
  function nodeColor(d){ return colors[1](_.indexOf(recTypes.nodes[l.colorBy.node], d[l.colorBy.node])) }

  function getProp(d, prop){ return _.defaults(layout.links[d.typeId],l)[prop] }

  // event handlers
  function onZoomChange(){ l.spacingX = this.value; update() }
  function focusOn(e){
    if(e.source) d3.select('#l'+e.target.recordId+', #l'+e.source.recordId).style('opacity', .5);
    else d3.select(this).style('opacity', .2);

    d3.selectAll('.node, .edges, .nodeTimeline').filter(function(d, i){
      var testRel = false;
      if(e.recordTypeId === 1) testRel = d.source.recordId === e.source.recordId || d.target.recordId === e.target.recordId
      return (d.source.recordId === e.recordId || d.target.recordId === e.recordId || testRel )
    })
    .style('stroke-width',0)
    .style('opacity', 0);

    d3.selectAll('.listItem text').filter(function(d, i){
      if(e.recordTypeId !== 1 ) return e.recordId !== d.recordId;
      return e.target.recordId !== d.recordId && e.source.recordId !== d.recordId;
    })
    .style('opacity',0.3);
  }
  function focusOff(e){
    d3.selectAll('.hoverZoneLines').style('opacity', 0)
    d3.selectAll('.node, .edges').style('opacity', 1)
    d3.selectAll('.edges').style('stroke-width',function(d){getProp(d, "edgesWidth")});
    d3.selectAll('.listItem text').style('opacity', 1);
  }
  function onClick(e){
    var state = d3.select(this).attr('active');
    d3.select(this).attr('active', 1-state);

    d3.selectAll('.node').filter(function(d, i){
      var testRel = false;

      if(e.recordTypeId === 1) testRel = d.source.recordId === e.source.recordId || d.target.recordId === e.target.recordId
      if(d.source) testRel = testRel || d.source.recordId === e.recordId || d.target.recordId === e.recordId
      return  testRel
    }).style('opacity',state)

    d3.selectAll('.edges').filter(function(d, i){
      return d.source.recordId === e.recordId || d.target.recordId === e.recordId
    }).style('stroke-width', function(d){return state * getProp(d, "edgesWidth")})

    d3.selectAll('.nodeTimeline').filter(function(d,i){
      return d.recordId === e.recordId
    }).style('stroke-width',state * l.entityLineWidth);
  }
  function onLinkTypeClick(e){
    var state = d3.select(this).attr('active');
    d3.select(this).attr('active', 1-state)
    d3.selectAll('.node, .edges').filter(function(d){
      return e === d.typeId;
    }).style('opacity',state)
  }
  function yearLabelOn(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 0.2);
    d3.select(this).transition().style('opacity', 1);
  }
  function yearLabelOff(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 1);
  }

  var w = _(g.links).map('rank').max() * (l.spacingX+5) + l.offsetX , h = l.offsetY,
      svg = d3.select('#explo').append('svg:svg').attr('width', w).attr('height', h)

  // range input event
  d3.select('#zoom').on('input', onZoomChange);

  // lines from the first to the last event
  var nodeTimelines = svg.selectAll('.nodeTimelines')
    .data(g.nodeTimelines).enter()
    .append('g')
    .filter(function(d){ return d.startId !== d.endId})
    .attr('class','nodeTimelines');

  var existsLine = nodeTimelines.append('line')
    .attr('y1', function(d){ return eventPosY[d.recordId]})
    .attr('y2', function(d){ return eventPosY[d.recordId]})
    .style('stroke', nodeColor)
    .style('stroke-width', l.entityLineWidth)
    .style('opacity', 1)
    .attr('id',function(d){ return 'l'+d.recordId } )
    .attr('class','nodeTimeline');

  // list nodes
  var list = svg.selectAll('.entities')
    .data(g.nodes).enter()
    .append('g')
    .attr('class','listItem')
    .attr('active',0)
    .on('click', onClick)

    // labels
    list.append('text')
    .attr('x', 20)
    .attr('y', function(d){return eventPosY[d.recordId]})
    .attr('transform', 'translate(3, 4)')
    .text(function(d){return _.trunc(d.shortName)})
    .style('fill', nodeColor)
    .append('title')
    .attr('class','nodeTypeLabel')
    .text(function(d) { return d.typeName})

    // hover invisible zone
    list.append('line')
    .attr('x1', 200)
    .attr('y1', function(d){return eventPosY[d.recordId]})
    .attr('x2', w)
    .attr('y2', function(d){return eventPosY[d.recordId]})
    .attr('class','hoverZoneLines' )
    .attr('transform', 'translate(-80)')
    .attr('id',function(d){ return 'l'+d.recordId } )

    // horizontal grid
    list.append('line')
    .attr('x1', l.offsetX - l.spacingY)
    .attr('y1', function(d){return eventPosY[d.recordId]})
    .attr('x2', w)
    .attr('y2', function(d){return eventPosY[d.recordId]})
    .style('stroke', 'black')
    .style('opacity', l.gridOpacity)
    .attr('id',function(d){ return 'l'+d.recordId } )

  // node group labels
  var groupLabel = svg.selectAll('.groupLabel')
    .data(g.groups).enter()
    .append('text')
    .attr('x', 5)
    .attr('y', function(d){return d.offsetY -  l.spacingY})
    .attr('class', 'groupLabel')
    .text(function(d){ return d.name });

  // links type labels
  var linkTypeCaption = svg.selectAll('.linkTypeCaption')
    .data(recTypes.links[l.colorBy.link]).enter()
    .append('g')
    .append('text')
    .attr('x', function(d, i){return 250 + _.floor(i/2)*100})
    .attr('y', function(d, i){return 10 + (i%2)*l.spacingY})
    .attr('active',0)
    .text(function(d, i){
      var sample = _.find(g.links, {"typeId":d})
      return sample ? sample.typeName : d;
    })
    .style('fill', function(d,i){return colors[0](i)})
    .on('click', onLinkTypeClick);

  // draw events
  var prevDate;
  var event = svg.selectAll('.event')
    .data(g.links)
    .enter()
    .append('g')
    .attr('id',function(d){ return d.recordId } )
    .attr('class', function(d){
      var isShown = prevDate !== d.startDate; prevDate = d.startDate;
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
  var yearLabel = event.append('text')
    .attr('class', 'yearLabel')
    .text(function(d){return d.startDate})
    .attr('transform', 'translate(' + 4 + ',' + 0 + ')')
    .attr('text-anchor', 'middle')
    .attr('y', 60)
    .attr('width', 0)
    .on('mouseover', yearLabelOn)
    .on('mouseout', yearLabelOff)

  // year mark
  var yearMark = event.append('line')
    .attr('class', 'yearMark')
    .attr('y1', 50)
    .attr('y2', h)
    .style('opacity',l.gridOpacity)
    .attr('transform', 'translate(' + -10 + ',' + 0 + ')')

    ;
  // edges
  var edges = event.append('line')
    .attr('class', 'edges')
    .style('stroke',linkColor)
    .attr('y1', sourceY)
    .attr('y2', targetY)

  // source node
  var sourceNode = event.append('circle')
    .attr('class','node source' )
    .attr('cy', sourceY)
    .style('fill', linkColor)
    .attr('r', l.rSource)
    // .on('mouseover', focusOn)
    // .on('mouseout', focusOff);

  // target node
  var targetNode = event.append('circle')
    .attr('class','node target')
    .attr('cy', targetY)
    .style('fill', linkColor)
    .attr('r', l.rTarget)
    // .on('mouseover', focusOn)
    // .on('mouseout', focusOff);

  update();

  // update attributes
  function update(){

    existsLine
      .attr('x1', function(d,i){ return l.offsetX + indexes.links.recordId[d.startId].rank * l.spacingX})
      .attr('x2', function(d,i){ return l.offsetX + indexes.links.recordId[d.endId].rank * l.spacingX})

    d3.selectAll('.existsLine')
      .attr('x1', function(d){ return l.offsetX + indexes.links.recordId[d.startId].rank * l.spacingX})
      .attr('x2', function(d){ return l.offsetX + indexes.links.recordId[d.endId].rank * l.spacingX})

    // year label
    yearLabel.attr('x',linkX)

    // year mark
    yearMark
      .attr('x1', linkX)
      .attr('x2', linkX)

    // edges
    edges
      .attr('x1', linkX)
      .attr('x2', linkX)
      .style('stroke-width', function(d){ return l.spacingX < 4 ? 0 : getProp(d, "edgesWidth") })

    // source node
    targetNode.attr('cx', linkX)

    // target node
    sourceNode.attr('cx', linkX)
  }

}
