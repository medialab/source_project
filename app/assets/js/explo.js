var config  = {}, g = {};

d3.json('../config.json', function(error, config){
  g.conf = config;
  g.corpus = _(config.corpus).filter(function(value, key) {return key === corpusId;}).first();
  g.layout = typeof g.corpus.layout !== 'undefined' ? g.corpus.layout : {};
  d3.json('data/'+g.corpus.template+'_'+ corpusId +'.json', onData);
});

function onData(error, data) {

  console.log(data, error);

  data = data.results

  console.log('->>',_(data).reject('recordTypeId',1).sortBy('recordId').map('recordId').value());
  console.log('->>',_(data).keys().value().length)
  var eventPosY = {}, eventPosX = {},
      l = _.defaults(g.layout, g.conf.layout);

  console.log('\n== data report == \n',Sutils.dataCheck(data),'\n== end ==\n\n');

  // merge nodes from relation
  g.conf.relMerges = typeof g.corpus.relMerges !== 'undefined' ? g.corpus.relMerges : g.conf.relMerges;
  data = Sutils.mergeNodesFromRelation(data, g.conf, l);

  // get relations with a source and a target
  g.links = _(Sutils.getValidLinks(data, g.conf, l))
    .filter(function(d){return g.corpus.links.reject ? Sutils.multiValueFilter(d, g.corpus.links.reject, true) : true})
    .sortByOrder(g.corpus.links.sortBy, g.corpus.links.sortOrder)
    .value();

  // get linked nodes
  g.nodes = Sutils.getLinkedNodes(data, g.links);

  // get nodes time bounds
  g.nodeTimelines = Sutils.getNodeLines(g.nodes, g.links, l)

  // get bounds
  g.linksPeriod = Sutils.getTimeBounds(g.links),

  // group from config
  g.corpus.nodes.groups.forEach(function(group){
    g[group.name] = _(g.nodes)
    .filter(group.filter)
    .filter(function(d){return group.reject ? Sutils.multiValueFilter(d, group.reject, true) : true})
    .sortByOrder(group.sortBy, group.sortOrder)
    .value();
  })

  // get groups names
  g.groups = g.corpus.nodes.groups;
  g.groups.forEach(function(group){
    group.offsetY = l.offsetY;
    g[group.name].forEach(function(d, i){ eventPosY[d.recordId] = l.offsetY + i * l.spacingY});
    l.offsetY += (g[group.name].length) * l.spacingY + l.spacingY*2;
  });

  // indexes and layout overide
  var indexType = ['typeId','typeName','recordTypeId','startDate','recordId','category','typeGroup'],
      indexes = {nodes:{},links:{}},
      recTypes = {nodes:{},links:{}};

  _.forEach(indexType, function(d){
    indexes.nodes[d] = _.groupBy(g.nodes, d);
    indexes.links[d] = _.groupBy(g.links, d);
    recTypes.nodes[d] = _(g.nodes).sortBy(d).map(d).uniq().value();
    recTypes.links[d] = _(g.links).sortBy(d).map(d).uniq().value();
  })

  var line = d3.svg.line()
  .y(function(d,i) {
    var link = indexes.links.recordId[d[1]][0];
    return (d[0] ? sourceY(link) : targetY(link)) //+ i *2
    // var link = _.findIndex(g.links, 'recordId', d[1]);
    // return link * l.spacingX/2
  })
  .x(function(d,i) {
    var link = indexes.links.recordId[d[1]][0];
    return linkX(link) //+ i *2
  })
  .interpolate(g.layout.pathwayInterpolation);
  // linear step-before step-after basis basis-open basis-closed
  // cardinal cardinal-open cardinal-closed monotone

  indexes.byPath =  Sutils.indexPathway(g,'recordId');

  g.pathway = _(indexes.byPath)
    .uniq(function(d){return line(d)})
    .map(function(d){
      return _(d).sortBy(function(p){
        var link = indexes.links.recordId[p[1]][0];
        return _.padLeft( (d[0] ? sourceY(link) : targetY(link)) , 6 , '0')
      }).value()
    }).value()

  g.clusters = _(indexes.byPath)
    .groupBy(function(d){return line(d)})
    .toArray()
    .forEach(function(c,i){
      _.forEach(c[0], function(n){ indexes.nodes.recordId[n[2]][0].group = i;})
    }).value()

  var layout = { nodes: Sutils.getCustomLayout(g, 'nodes'), links: Sutils.getCustomLayout(g, 'links')};
  var typeCount = _.keys(indexes.nodes[l.nodesColors]).length;

  var colors = [
    typeCount < 10 ? d3.scale.category10() : d3.scale.category20(),
    d3.scale.ordinal().range(Sutils.colors[0])
  ];
  console.log('layout', layout)
  console.log('\ng',g, '\nindexes',indexes, '\nrecTypes',recTypes, Sutils.dataCheck(g.links));

  console.log(
    _.difference(
      _(data).reject('recordTypeId',1).map('shortName').value(),
      _.map(g.nodes,'shortName')
    )
  )

  // attributes formulas
  function sourceY(d){ return eventPosY[d.source.recordId] }
  function targetY(d){ return eventPosY[d.target.recordId] }
  function linkX(d,i){
    if(l.linearTime) return l.offsetX + (d.startDate - g.linksPeriod.start) * l.spacingX*l.YearSpacing
    return l.offsetX + d.rank * l.spacingX
  }
  function linkColor(d){

    var linksColors = l.linksColors;

    if(linksColors === "source" || linksColors === "target") { return nodeColor(d[linksColors]); }

    if(Sutils.Palettes[linksColors][d[linksColors]]) return Sutils.Palettes[linksColors][d[linksColors]];

    return colors[1](_.indexOf(recTypes.links[linksColors], d[linksColors]))
  }
  function nodeColor(d){
    return colors[0](
      _.indexOf(
        recTypes.nodes[getLayout(d,'nodes', 'nodesColors')],
        d[getLayout(d,'nodes', 'nodesColors')]
      )
    )
  }
  function getLayout(d, type, prop){
    return _.defaults(layout[type][d.typeId],l)[prop]
  }

  // event handlers
  function onZoomChange(){ l.spacingX = this.value; update() }
  function onClick(e,f,g,h){
    var keyDown = window.event.metaKey;
    var state = parseInt(d3.select(this).attr('active'));

    d3.selectAll('.node').filter(function(d, i){
      var test = false;
      if(e.recordTypeId === 1) test = d.source.recordId === e.source.recordId || d.target.recordId === e.target.recordId
      if(d.source) test = test || d.source.recordId === e.recordId || d.target.recordId === e.recordId
      return keyDown ? !test : test
    }).style('opacity',state)

    d3.selectAll('.edges').filter(function(d, i){
      var test = (d.source.recordId === e.recordId || d.target.recordId === e.recordId)
      return keyDown ? !test : test
    }).attr('visibility', function(d){ return isVisible(state)} )

    d3.selectAll('.nodeTimeline').filter(function(d,i){
      var test = d.recordId === e.recordId
      return keyDown ? !test : test
    }).attr('visibility', function(d){ return isVisible(state) })

    d3.selectAll('.listItem').filter(function(d,i){
      var test = d.recordId === e.recordId
      return keyDown ? !test : test
    }).attr('active', 1-state)

    d3.selectAll('.pathway').filter(function(d,i){
      var test = d[0][2] === e.recordId
      return keyDown ? !test : test
    }).attr('visibility', function(d){ return isVisible(state) })

    d3.select(this).attr('active', 1-state)

  }
  function onLinkTypeClick(e){
    var state = parseInt(d3.select(this).attr('active'));
    d3.select(this).attr('active', 1-state)

    d3.selectAll('.node, .edges').filter(function(d){
      return e === d.typeId;
    }).attr('visibility', function(d){return isVisible(state)})
  }
  function isVisible(v){ return v ? 'visible' : 'hidden'}

  function nodeMouseOver(e){
      d3.selectAll('.grid')
        .filter(function(d){return e.source.recordId === d.recordId || e.target.recordId === d.recordId})
        .style('opacity',1)
  }
  function nodeMouseOut(e){
      d3.selectAll('.grid').style('opacity', l.gridOpacity )
  }
  function yearLabelOn(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 0.2);
    d3.select(this).transition().style('opacity', 1);
  }
  function yearLabelOff(d){ d3.selectAll('.yearLabel').transition().style('opacity', 1);}

  var w = _(g.links).map('rank').max() * (l.spacingX+20) + l.offsetX , h = l.offsetY,
      svg = d3.select('#explo').append('svg:svg').attr('width', w).attr('height', h)


    defs = svg.append("defs")

    defs.append("marker")
        .attr({
          "id":"arrow",
          "viewBox":"0 -5 10 10",
          "refX":5,
          "refY":0,
          "markerWidth":0.7,
          "markerHeight":0.7,
          "orient":"auto"
        })
        .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("class","arrowHead")
          .style('fill','white')

  // range input event
  d3.select('#zoom').on('input', onZoomChange);

  // lines from the first to the last event
  var nodeTimelines = svg.selectAll('.nodeTimelines')
    .data(g.nodeTimelines).enter()
    .append('g')
    // .filter(function(d){ return d.startId !== d.endId})
    .attr('class','nodeTimelines');

  var existsLine = nodeTimelines.append('line')
    .attr('y1', function(d){ return eventPosY[d.recordId]})
    .attr('y2', function(d){ return eventPosY[d.recordId]})
    .style('stroke', nodeColor)
    .style('stroke-width', function(d){return getLayout(d, 'nodes', 'entityLineWidth')})
    .style('opacity', function(d){return getLayout(d,'nodes', 'entityLineOpacity')})
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
    .text(function(d) { return d.typeName +' ('+d.recordTypeId+'—'+d.typeId+')'})

    // hover invisible zone
    list.append('line')
    .attr('x1', 0)
    .attr('y1', function(d){return eventPosY[d.recordId]})
    .attr('x2', w)
    .attr('y2', function(d){return eventPosY[d.recordId]})
    .attr('class','hoverZoneLines' )
    .attr('id',function(d){ return 'l'+d.recordId } )
    .style('stroke-width', l.spacingY-1)

    // horizontal grid
    list.append('line')
    .attr('class','grid')
    .attr('x1', 0 + l.spacingY)
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

  if(l.linksColors !== 'source' && l.linksColors !== 'target'){
    var linkTypeCaption = svg.selectAll('.linkTypeCaption')
    .data(recTypes.links[l.linksColors]).enter()
    .append('g')
    .append('text')
    .attr('x', function(d, i){return 250 + _.floor(i/2)*150})
    .attr('y', function(d, i){return 10 + (i%2)*l.spacingY})
    .attr('active',0)
    .text(function(d, i){
      var sample = _.find(g.links, {'typeId':d})
      return sample ? sample.typeName + ' ('+indexes.links.typeId[d].length+')' : d;
    })
    .style('fill', function(d,i){
      if(Sutils.Palettes[l.linksColors][d]) return Sutils.Palettes[l.linksColors][d];
      return colors[1](i)
    })
    .on('click', onLinkTypeClick)
    .append('title')
    .text(function(d) {
      var sample = _.find(g.links, {'typeId':d})
      if(sample) return sample.typeId;
    })

  }

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
        + '\n\t['+ d.typeName + ' — ' + d.typeId + ']\n'
        + '\t\t' + d.target.shortName
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

  // source node
  var sourceNode = event.append('circle')
    .attr('class','node source' )
    .attr('cy', sourceY)
    .style('fill', linkColor)
    .attr('r', function(d){return getLayout(d,'links', 'sourceR')})
    .style('opacity', function(d){return getLayout(d,'links', 'sourceOpacity')})
    .on('mouseover', nodeMouseOver)
    .on('mouseout', nodeMouseOut)

  // target node
  var targetNode = event.append('circle')
    .attr('class','node target')
    .attr('cy', targetY)
    .style('fill', linkColor)
    .attr('r', function(d){return getLayout(d,'links', 'targetR')})
    .style('opacity', function(d){return getLayout(d,'links', 'targetOpacity')})
    .on('mouseover', nodeMouseOver)
    .on('mouseout', nodeMouseOut)

  // edges
  var edgesShadow = event.append('line')
    .attr('class', 'edges')
    .style('stroke',"white")
    .style('opacity', function(d){ return getLayout(d, 'links', 'linksColorsShadowOpacity') })
    .attr('y1', sourceY)
    .attr('y2', targetY)
    .attr('visibility', function(d){ return getLayout(d,'links', 'edgesHover') ? 'hidden' : 'visible'})
    .attr("marker-end", function(d) { return "url(#arrow)"; });

  var edges = event.append('line')
    .attr('class', 'edges')
    .style('stroke',linkColor)
    .style('opacity', function(d){ return getLayout(d, 'links', 'edgesOpacity') })
    .attr('y1', sourceY)
    .attr('y2', targetY)
    .attr('visibility', function(d){ return getLayout(d,'links', 'edgesHover') ? 'hidden' : 'visible'})
    .attr("marker-end", function(d) { return "url(#arrow)"; });


  var entityPath = svg.selectAll('.pathway')
    .data(g.pathway).enter()
    .append('path')
    .attr('class','pathway')
    .attr('d', line)
    .style('stroke-width', g.layout.pathwayStrokeWidth)
    .style('stroke', function(d,i){
      var node = indexes.nodes.recordId[d[0][2]][0];
      return nodeColor(node)
    })
    .style('opacity',g.layout.pathwayOpacity)
    .style('stroke-linecap', 'round')
    .style('stroke-linejoin', 'round')
    .style('fill',function(d,i){
      var node = indexes.nodes.recordId[d[0][2]][0];
      return g.layout.pathwayFill ? nodeColor(node) : 'none'
    })

  entityPath.append('title')
    .attr('class','pathwayLabek')
    .text(function(d) { return indexes.nodes.recordId[d[0][2]][0].shortName;})

  update();

  // update attributes
  function update(){

    existsLine
      .attr('x1', function(d,i){
        var v = indexes.links.recordId[d.startId][0];
        if(g.layout.linearTime) return l.offsetX + (v.startDate - g.linksPeriod.start) * l.spacingX * l.YearSpacing;
        return l.offsetX + indexes.links.recordId[d.startId][0].rank * l.spacingX
      })
      .attr('x2', function(d,i){

        var v = indexes.links.recordId[d.endId][0];

        if(g.layout.linearTime) return l.offsetX + (v.startDate - g.linksPeriod.start) * l.spacingX * l.YearSpacing;
        return l.offsetX + indexes.links.recordId[d.endId][0].rank * l.spacingX
      })

    // year label
    yearLabel
      .attr('x',linkX)

    // year mark
    yearMark
      .attr('x1', linkX)
      .attr('x2', linkX)

    entityPath
      .attr('d', line)

    // edges
    edges
      .attr('x1', linkX)
      .attr('x2', linkX)
      .style('stroke-width', function(d){ return l.spacingX < 3 ? 0 : getLayout(d, 'links', 'edgesWidth') })

    edgesShadow
      .attr('x1', linkX)
      .attr('x2', linkX)
      .style('stroke-width', function(d){

        return l.spacingX < 3 ? 0 : getLayout(d, 'links', 'edgesWidth') + getLayout(d, 'links', 'linksColorsShadowWidth')

      })

    // source node
    targetNode
      .attr('cx', linkX)

    // target node
    sourceNode
      .attr('cx', linkX)
  }
}
