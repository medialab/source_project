const apiUrl = 'data/heurist-cache-2.json';


d3.json(apiUrl, function(error, data) {

  if (error) throw error;


  console.log(data);

  var graph =  {};
  var so = new Source(data);

  // list relations
  graph.rel = so.getValidRel();

  // // list administration
  graph.org = _(data)
    .filter('recordTypeId', 4)
    .reject('typeId', 5314)
    .sortBy(['typeId','startDate'])
    .value();

  // list states
  graph.sta = _(data)
    .filter('typeId', 5314) // states
    .value();

  // list documents
  graph.doc = _(data)
    .filter('recordTypeId', 13)
    .sortBy(['typeId','startDate'])
    .value();

  // doc index
  graph.doc_index = {}
  graph.doc.forEach(function(d){
    graph.doc_index[d.recordId] = d
  })

  // org index
  graph.org_index = {}
  graph.org.forEach(function(d){
    graph.org_index[d.recordId] = d
  })

  // rel index
  graph.rel_index = {}
  graph.rel.forEach(function(d){
    graph.rel_index[d.recordId] = d
  })

  // matching tables
  var obj_to_y = {};

  var org_offset = 660,
      org_spacing = 11
  graph.org.forEach(function(d, i){
    obj_to_y[d.recordId] = org_offset + i * org_spacing
  })

  var state_offset = 20,
      state_spacing = 11
  graph.sta.forEach(function(d, i){
    obj_to_y[d.recordId] = state_offset + i * state_spacing
  })

  var doc_offset = 400,
      doc_spacing = 11
  graph.doc.forEach(function(d, i){
    obj_to_y[d.recordId] = doc_offset + i * doc_spacing
  })

  console.log(graph)

  var w = 2000, h = 3000,
    color = d3.scale.category20();
    start = so.getTimeBounds().start,
    end = so.getTimeBounds().end,
    rel_offset = 150, rel_spacing = 7,

  svg = d3.select('#basic').append('svg:svg')
  .attr('width', w)
  .attr('height', h)

  var marker = svg.append('defs')
    .append('marker').attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 12)
    .attr('refY', 5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .style('fill', 'grey')
    .attr('orient', 'auto');

    marker.append('path')
      .attr("d", 'M 0 0 L 10 5 L 0 10 z');


    var relTypes = so.getTypes({'recordTypeId':1});

  var orga = svg.selectAll('.org')
    .data(graph.org.slice(0).concat(graph.doc).slice(0).concat(graph.sta))
    .enter()
    .append('g')

    orga.append('text')
      .attr('x', 20)
      .attr('y', function(d){return obj_to_y[d.recordId]})
      .attr('transform', 'translate(0, 4)')
      .text(function(d){return d.shortName})

    orga.append('line')
          .attr('x1', 100)
          .attr('y1', function(d){return obj_to_y[d.recordId]})
          .attr('x2', w)
          .attr('y2', function(d){return obj_to_y[d.recordId]})
          .attr('class','axis' )
          .style('stroke', 'grey')
          .attr('transform', 'translate(-80)')
          .on("mouseover", function(d) {d3.select(this).style("stroke", "black");})
          .on("mouseout", function(d) {d3.select(this).style("stroke", "grey");});


  var group = svg.selectAll('.event')
    .data(graph.rel)
    .enter()
    .append('g')

  var prevDate = '';

    group.append("title").text(function(d) {
        return  d.source.shortName + ' ' + d.typeName + ' ' + d.target.shortName
          +' ('+d.recordId+')\n—\n[[' + d.title + ']]'
      })

    group.append('text')
      .attr('x', function(d,i){ return rel_offset + i * rel_spacing })
      .attr('y', 20)
      .text(function(d){
        console.log(prevDate,d.startDate, prevDate !== d.startDate)
        var isShown = prevDate === d.startDate
        prevDate = d.startDate
        if(isShown) return ''
        return d.startDate
      });

    group.append('line')
      .attr('x1', function(d,i){ return rel_offset + i * rel_spacing })
      .attr('x2', function(d,i){ return rel_offset + i * rel_spacing })
      .attr('y1', function(d){ return obj_to_y[d.source.recordId] })
      .attr('y2', function(d){ return obj_to_y[d.target.recordId] })
      .attr('marker-end', 'url(#arrow)')
      .style('stroke',function(d){return color(_.indexOf(relTypes, d.typeId));})
      .style('stroke-width', 1)


    group.append('circle')
      .attr('cx', function(d,i){ return rel_offset + i * rel_spacing })
      .attr('cy', function(d){ return obj_to_y[d.source.recordId] })
      .attr('r', 4)
      .style('fill',function(d){return color(_.indexOf(relTypes, d.typeId));})

    group.append('circle')
      .attr('cx', function(d,i){ return rel_offset + i * rel_spacing })
      .attr('cy', function(d){ return obj_to_y[d.target.recordId] })
      .attr('r', 4)
      .attr('title', function(d){ d.shortName } )
      .style('fill', function(d){return color(_.indexOf(relTypes, d.typeId));})



})



