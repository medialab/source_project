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


  var eventPosY = {}, eventPosX = {}, l = _.defaults(g.layout, g.conf.layout);

  console.log('\n== data report == \n',Sutils.dataCheck(data),'\n== end ==\n\n');

  // merge nodes from relation
  g.conf.relMerges = typeof g.corpus.relMerges !== 'undefined' ? g.corpus.relMerges : g.conf.relMerges;
  data = Sutils.mergeNodesFromRelation(data, g.conf, l);


  // adding fake relation to have a proper startdate #shameOnYou
  data.push({recordId: 9999, recordTypeId: 1, recordTypeName: "Record relationship", source: g.corpus.continueId, startDate: 2015, target: g.corpus.continueId, title: "", typeId: 1234, typeName: "end"})

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

  // indexes
  var indexType = ['typeId','typeName','recordTypeId','startDate','recordId','category','typeGroup'],
      indexes = {nodes:{},links:{}},
      recTypes = {nodes:{},links:{}};


  _.forEach(indexType, function(d){
    indexes.nodes[d] = _.groupBy(g.nodes, d);
    indexes.links[d] = _.groupBy(g.links, d);
    recTypes.nodes[d] = _(g.nodes).sortBy(d).map(d).uniq().value();
    recTypes.links[d] = _(g.links).reject('typeId',1234).sortBy(d).map(d).uniq().value();
  })

  var line = d3.svg.line()
  .y(function(d,i) {
    var link = indexes.links.recordId[d[1]][0];
    return (d[0] ? sourceY(link) : targetY(link)) //+ i *2
  })
  .x(function(d,i) {
    var link = indexes.links.recordId[d[1]][0];
    return linkX(link) //+ i *2
  }).interpolate(g.layout.pathwayInterpolation);

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
  var ntCount = _.keys(indexes.nodes[l.nodesColors]).length;
  var ltCount = _.keys(indexes.links[l.linksColors]).length;

  var filteredColors = _(colorbrewer.Set2[8]).filter(function (d) {return d !== "#fc8d62";}).value();
  var getNodeColor = (ntCount < 7 ? d3.scale.ordinal().range(filteredColors) : d3.scale.category20() )
  var getLinkColor = (ltCount < 8 ? d3.scale.category10() : d3.scale.category20() )

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
    return getLinkColor(_.indexOf(recTypes.links[linksColors], d[linksColors]))
  }
  function nodeColor(d){
    return getNodeColor(
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

    if(keyDown) {
      state = !state;
      d3.selectAll('.listItem').attr('active', 0);
      d3.selectAll('.node, .edges, .nodeTimeline').attr('visibility', 'hidden');
    }

    d3.selectAll('.recordId'+e.recordId+', .sourceRecordId'+e.recordId+', .targetRecordId'+e.recordId).attr('visibility', function(d){ return isVisible(state)} )
    d3.select(this).attr('active', 1-state);
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
      d3.selectAll('.hoverZoneLines')
        .filter(function(d){return e.source.recordId === d.recordId || e.target.recordId === d.recordId})
        .style('opacity',0.4)
  }
  function nodeMouseOut(e){
      d3.selectAll('.hoverZoneLines').style('opacity', 0)
  }
  function yearLabelOn(d){
    d3.selectAll('.yearLabel').transition().style('opacity', 0.2);
    d3.select(this).transition().style('opacity', 1);
  }
  function yearLabelOff(d){ d3.selectAll('.yearLabel').transition().style('opacity', 1);}

  var w = _(g.links).map('rank').max() * (l.spacingX+20) + l.offsetX , h = l.offsetY,
      svg = d3.select('.graph').append('svg:svg').attr('width', w).attr('height', h + 2 * l.offsetY)


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
    .attr('class',function (d) {return 'nodeTimeline recordId'+d.recordId})

  // list nodes
  var list = svg.selectAll('.entities')
    .data(g.nodes).enter()
    .append('g')
    .attr('class','listItem')
    .attr('active',0)
    .on('click', onClick)

    // labels
    list.append('text')
    .attr('x', 10)
    .attr('y', function(d){return eventPosY[d.recordId]})
    .attr('transform', 'translate(3, 4)')
    .text(function(d){return _.trunc(d.shortName, 80)})
    .style('fill', nodeColor)
    .append('title')
    .attr('class','nodeTypeLabel')
    .text(function(d) { return d.typeName +' ('+d.recordTypeId+'—'+d.typeId+')'})

    // hover invisible zone
    list.append('line')
    .attr('x1', 0)
    .attr('y1', function(d){return eventPosY[d.recordId] + 1 })
    .attr('x2', w)
    .attr('y2', function(d){return eventPosY[d.recordId]})
    .attr('class','hoverZoneLines')
    .attr('id',function(d){ return 'l'+d.recordId } )
    .style('stroke-width', l.spacingY - 4)
    .on('mouseover', function (d) {
      d3.select(this).style('opacity',.4)
    })
    .on('mouseleave', function (d) {
      d3.select(this).style('opacity',0)
    })
    // horizontal grid
    list.append('line')
    .attr('class','grid')
    .attr('x1', l.offsetX)
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

    var captionWidth = 180;
    var captionSpacing = 25;
    svg.append('text')
      .text('RELATION TYPES COLORS')
      .attr('x', function(d){ return l.offsetX } )
      .attr('y', function(d,i){return _(eventPosY).max() + 5 * l.spacingY +3 } )

    var linkTypeCaption = svg.selectAll('.linkTypeCaption')
    .data(recTypes.links[l.linksColors]).enter()
    .append('g')
    .attr('transform', function(d,i){

      var x = l.offsetX + _.floor(i/l.linkTypeLabelByline)*captionWidth + captionWidth ;
      var y = (_(eventPosY).max() + 5 * l.spacingY) + (i%l.linkTypeLabelByline) * (l.spacingY *1.2)
      return 'translate(' + x + ',' + y + ')';
    })
    linkTypeCaption.append('text')

    .attr('active',0)
    .text(function(d, i){
      var sample = _.find(g.links, {'typeId':d})
      return sample ? sample.typeName + ' ('+indexes.links.typeId[d].length+')' : d;
    })
    .attr('text-anchor', 'middle')
    .attr('class',function (d) {return 'typeCaption recordId'+d.recordId+' '+l.linksColors+d})
    .attr('x', (captionWidth-captionSpacing)/2 )
    .attr('y', -3 )
    // .style('fill', function(d,i){ return getLinkColor(i)})
    .on('click', onLinkTypeClick)
    .append('title')
    .text(function(d) {
      var sample = _.find(g.links, {'typeId':d})
      if(sample) return sample.typeId;
    })


    linkTypeCaption.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', captionWidth-captionSpacing)
        .attr('y2', 0)
        .style('stroke', function(d,i){ return getLinkColor(i)})
        .attr('class',function (d) {return 'edges recordId'+d.recordId+' '+l.linksColors+d})


    linkTypeCaption.append('circle')
      .attr('r', l.sourceR)
      .attr('class',function (d) {return 'node source recordId'+d.recordId+' '+l.linksColors+d})
      .style('fill', function(d,i){ return getLinkColor(i)})

    linkTypeCaption.append('circle')
      .attr('r', l.sourceR)
      .attr('class',function (d) {return 'node target recordId'+d.recordId+' '+l.linksColors+d})

      .attr('cx', captionWidth-captionSpacing)
      .style('fill','white')
      .style('stroke', function(d,i){ return getLinkColor(i)})
      .style('stroke-width', function(d){return l.targetR/3 } )

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
        + d.source.shortName + '  ('+d.source. recordId+')'
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
    .attr('y', 12)
    .attr('width', 0)
    .on('mouseover', yearLabelOn)
    .on('mouseout', yearLabelOff)

  // year mark
  var yearMark = event.append('line')
    .attr('class', 'yearMark')
    .attr('y1', 0)
    .attr('y2', h)
    .style('opacity',l.gridOpacity)
    .attr('transform', 'translate(' + -10 + ',' + 0 + ')')

  // target node
  var targetNode = event.append('circle')
    .attr('class',function (d) {return 'node target sourceRecordId'+d.source.recordId+'  targetRecordId'+d.target.recordId+' recordId'+d.recordId+' '+l.linksColors+d.typeId})
    .attr('cy', targetY)
    .style('stroke', linkColor)
    .style('stroke-width', function(d){return getLayout(d,'links', 'targetR')/3 } )
    .style('fill', 'transparent')
    .attr('r', function(d){return getLayout(d,'links', 'targetR')})
    .style('opacity', function(d){return getLayout(d,'links', 'targetOpacity')})
    .on('mouseover', nodeMouseOver)
    .on('mouseout', nodeMouseOut)

  // edges
  var edgesShadow = event.append('line')
    .attr('class',function (d) {return 'edges edgeShadow sourceRecordId'+d.source.recordId+'  targetRecordId'+d.target.recordId+' recordId'+d.recordId+' '+l.linksColors+d.typeId})
    .style('opacity', function(d){ return getLayout(d, 'links', 'linksColorsShadowOpacity') })
    .attr('y1', sourceY)
    .attr('y2', targetY)
    .attr('visibility', function(d){ return getLayout(d,'links', 'edgesHover') ? 'hidden' : 'visible'})
    .attr("marker-end", function(d) { return "url(#arrow)"; });

  var edges = event.append('line')
    .attr('class',function (d) {return 'edges  sourceRecordId'+d.source.recordId+'  targetRecordId'+d.target.recordId+' recordId'+d.recordId+' '+l.linksColors+d.typeId})
    .style('stroke',linkColor)
    .style('opacity', function(d){ return getLayout(d, 'links', 'edgesOpacity') })
    .attr('y1', sourceY)
    .attr('y2', targetY)
    .attr('visibility', function(d){ return getLayout(d,'links', 'edgesHover') ? 'hidden' : 'visible'})
    .attr("marker-end", function(d) { return "url(#arrow)"; });

  // source node
  var sourceNode = event.append('circle')
    .attr('class',function (d) {return 'node source sourceRecordId'+d.source.recordId+'  targetRecordId'+d.target.recordId+' recordId'+d.recordId+' '+l.linksColors+d.typeId})
    .attr('cy', sourceY)
    .style('fill', linkColor)
    .attr('r', function(d){return getLayout(d,'links', 'sourceR')})
    .style('opacity', function(d){return getLayout(d,'links', 'sourceOpacity')})
    .on('mouseover', nodeMouseOver)
    .on('mouseout', nodeMouseOut)

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
      .attr('transform', 'translate(' + 5 + ',' + 0 + ')')

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
