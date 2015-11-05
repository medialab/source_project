var config  = {}, g = {};

d3.json('../config.json', function(error, config){
  g.conf = config;
  g.corpus = _(config.corpus)
    .filter(function(value, key) {return key === corpusId;})
    .first();
  d3.json('data/'+g.corpus.template+'_'+ corpusId +'.json', onData);
});

function onData(error, data) {

  if (error) throw error;

  console.log("\n== data report == \n",Sutils.dataCheck(data),"\n== end ==\n\n");

  var color = d3.scale.category10();
    offsetX = 250, spacingX = 8,
    offsetY = 100, spacingY = 13,
    spacingYear = 50,
    eventPosY = {},eventPosX = {};

  var param = typeof g.corpus.param !== 'undefined' ? g.corpus.param : {};

  var edgesWidth = typeof param.edgesWidth !== 'undefined' ? param.edgesWidth : 2;
  var existsWidth = typeof param.existsWidth !== 'undefined' ? param.existsWidth : 2;
  var rSource = typeof param.rSource !== 'undefined' ? param.rSource : 8;
  var rTarget = typeof param.rTarget !== 'undefined' ? param.rTarget : 4;

  // get relations with a source and a target
  g.links = _(Sutils.getValidLinks(data, g.conf))
    .filter(function(d){
      var res = true;
      _.forEach(g.corpus.rels.reject, function(n, key){
        console.log(n, key);
        n.forEach(function(val){
         res = (res && d[key] !== val);
        })
      })
      return res
    })
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
    group.offsetY = offsetY;
    g[group.name].forEach(function(d, i){
      eventPosY[d.recordId] = offsetY + i * spacingY
    });
    offsetY += (g[group.name].length) * spacingY + spacingY*2;
  });

  // indexes
  g.idx = {};
  g.idx.linksId = _.groupBy(g.links,'recordId');
  g.idx.linksTypeId = _.groupBy(g.links,'typeId');

  var w = _(g.links).map('rank').max() * (spacingX+5) + offsetX , h = offsetY;
  console.log(g, Sutils.dataCheck(g.links));

  g.linkType = Sutils.getTypes(g.links, {'recordTypeId':1});
  g.nodeType = Sutils.getTypes(g.nodes,'',{'recordTypeId':1});

  var svg = d3.select('#explo')
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h)

  // range input event
  d3.select("#zoom").on("input", function() {
    spacingX = this.value;
    update();
  });

  // attributes formulas
  function sourceY(d){ return eventPosY[d.source.recordId] }
  function targetY(d){ return eventPosY[d.target.recordId] }
  function linkX(d,i){ return offsetX + d.rank * spacingX }// + ((d.startDate - g.linksPeriod.start) * spacingYear)
  function linkTypeColor(d){
    if(g.corpus.layout === 1 ) return color(d.source.recordTypeId)
    return color(_.indexOf(g.linkType, d.typeId));
  }
  function nodeTypeColor(d,i){}
  function nodeTypeColor(d){
    if(g.corpus.layout === 1 ) return color(d.recordTypeId);
    return color(_.indexOf(g.nodeType, d.typeId));
  }

  function genInfo(d){
    return  d.startDate + '\n'
      + d.source.shortName + ' '
      + d.typeName + ' '
      + d.target.shortName
      +' ('+d.recordId+')\n—\n[[' + d.title + ']]'
  }

  // event handlers
  function focusOn(e){

    if(e.source) d3.select('#l'+e.target.recordId+', #l'+e.source.recordId).style('opacity', .5);
    else d3.select(this).style('opacity', .2);

    d3.selectAll('.node, .edges').filter(function(d, i){
      var testRel = false;
      if(e.recordTypeId === 1) testRel = d.source.recordId === e.source.recordId || d.target.recordId === e.target.recordId
      return ! (d.source.recordId === e.recordId || d.target.recordId === e.recordId || testRel )
    })
    .style('stroke-width',0)
    .style('opacity', 0)
    ;

    d3.selectAll('.listItem text').filter(function(d, i){
      if(e.recordTypeId !== 1 ) return e.recordId !== d.recordId;
      return e.target.recordId !== d.recordId && e.source.recordId !== d.recordId;

    })
    .style('opacity',0.3)
    ;
  }
  function focusOff(e){
    d3.selectAll('.hoverZoneLines').style('opacity', 0)
    d3.selectAll('.node, .edges').style('opacity', 1)
    d3.selectAll('.edges').style('stroke-width',edgesWidth);
    d3.selectAll('.listItem text').style('opacity', 1);
  }
  function yearLabelOn(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 0.2);
    d3.select(this).transition().style('opacity', 1);
  }
  function yearLabelOff(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 1);
  }

  // lines from the first to the last event
  var nodeTimelines = svg.selectAll('.nodeTimelines')
    .data(g.nodeTimelines).enter()
    .append('g')
    .attr('class','nodeTimelines');
  var existsLine = nodeTimelines.append('line')
    .attr('x1', function(d){ return offsetX + g.idx.linksId[d.startId][0].rank * spacingX})
    .attr('x2', function(d){ return offsetX + g.idx.linksId[d.endId][0].rank * spacingX})

    .attr('y1', function(d){ return eventPosY[d.recordId]})
    .attr('y2', function(d){ return eventPosY[d.recordId]})
    .style('stroke', nodeTypeColor)
    .style('stroke-width', existsWidth)
    .style('opacity', 1)
    .attr('id',function(d){ return 'l'+d.recordId } )
    .attr('class','nodeTimeline' );

  // list nodes
  var list = svg.selectAll('.entities')
    .data(g.nodes).enter()
    .append('g')
    .attr('class','listItem')

    list.append('text')
    .attr('x', 20)
    .attr('y', function(d){return eventPosY[d.recordId]})
    .attr('transform', 'translate(3, 4)')
    .text(function(d){return _.trunc(d.shortName)})
    .style('fill', nodeTypeColor)
    .append('title')
    .attr('class','nodeTypeLabel')
    .text(function(d) { return d.typeName})
    list.append('line')
    .attr('x1', 100)
    .attr('y1', function(d){return eventPosY[d.recordId]})
    .attr('x2', w)
    .attr('y2', function(d){return eventPosY[d.recordId]})
    .attr('class','hoverZoneLines' )
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

  // node group labels
  var groupLabel = svg.selectAll('.groupLabel')
    .data(g.groups).enter()
    .append('text')
    .attr('x', 5)
    .attr('y', function(d){return d.offsetY -  spacingY})
    .attr('class', 'groupLabel')
    .text(function(d){ return d.name });

  // links type labels
  var linkTypeCaption = svg.selectAll('.linkTypeCaption')
    .data(g.linkType).enter()
    .append('g')
    .append('text')
    .attr('x', function(d,  i){return 250 + _.floor(i/2)*100})
    .attr('y', function(d,  i){return 10 + (i%2)*spacingY})
    .text(function(d){
      return g.idx.linksTypeId[d][0].typeName;
    })
    .style('fill', function(d,i){return color(i);})

    .on('mouseover', function(e){
      d3.selectAll('.node, .edges').filter(function(d){
        return e !== d.typeId;
      }).style('opacity',0)
    })
    .on('mouseout', focusOff);
    ;

  // draw events
  var prevDate;
  var event = svg.selectAll('.event')
    .data(g.links)
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
    .attr('transform', 'translate(' + -10 + ',' + 0 + ')')

    ;
  // edges
  var edges = event.append('line')
    .attr('class', 'edges')
    .style('stroke',linkTypeColor)
    .attr('y1', sourceY)
    .attr('y2', targetY)

  // source node
  var sourceNode = event.append('circle')
    .attr('class','node source' )
    .attr('cy', sourceY)
    .style('fill',linkTypeColor)
    .attr('r', rSource)
    .on('mouseover', focusOn)
    .on('mouseout', focusOff);

  // target node
  var targetNode = event.append('circle')
    .attr('class','node target')
    .attr('cy', targetY)
    .style('fill', linkTypeColor)
    .attr('r', rTarget)
    .on('mouseover', focusOn)
    .on('mouseout', focusOff);

  update();

  // update attributes
  function update(){

    existsLine
      .attr('x1', function(d){ return offsetX + g.idx.linksId[d.startId][0].rank * spacingX})
      .attr('x2', function(d){ return offsetX + g.idx.linksId[d.endId][0].rank * spacingX})

    d3.selectAll('.existsLine')
      .attr('x1', function(d){ return offsetX + g.idx.linksId[d.startId][0].rank * spacingX})
      .attr('x2', function(d){ return offsetX + g.idx.linksId[d.endId][0].rank * spacingX})

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
      .style('stroke-width', function(d){
        return spacingX < 4 ? 0 : edgesWidth
      })

    // source node
    targetNode.attr('cx', linkX)

    // target node
    sourceNode.attr('cx', linkX)
  }

}
