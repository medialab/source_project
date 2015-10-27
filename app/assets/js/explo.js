
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
    color = d3.scale.category20();
    offsetX = 250, spacingX = 10,
    offsetY = 80, spacingY = 11,
    spacingYear = 50,
    eventPosY = {},eventPosX = {};

  function filterArray(d){
    // for (var values in d) {
    //   console.log(values);
    //   values.every(function(value){
    //     return (d[key] === value);
    //   });
    // };
    return true
  };


  // get relations with a source and a target
  graph.links = _(Sutils.getValidLinks(data))
    .filter(filterArray)
    .reject(graph.corpus.rels.reject || {'all':0} )
    .sortByOrder(graph.corpus.rels.sortBy, graph.corpus.rels.sortOrder)
    .value();
  ;

  // merge links with same year, target or source, type

  var rank = 0;
  graph.linksToMergeS =
  Sutils.nest(graph.links,[
    'startDate',
    function(d){ return d.typeId+'_'+d[graph.corpus.mergeDirection].recordId }
  ]);

  _.forEach(graph.linksToMergeS,function(year){
    _.forEach(year,function(group){

      group.forEach(function(d){
        d.rank = rank;
      });
      rank++;

    });
  })

  // get linked nodes
  graph.nodes = Sutils.getLinkedNodes(data, graph.links);

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
  graph.groupNames = _.map(graph.corpus.groups, 'name');

  //
  graph.nested = Sutils.nest(graph.links, [
    function(d){ return d.startDate },
    function(d){ return d.source.recordId },
    function(d){ return d.target.recordId }
  ]);

  graph.groupNames.forEach(function(c){

    graph[c].forEach(function(d, i){
      eventPosY[d.recordId] = offsetY + i * spacingY
    });

    offsetY += (graph[c].length) * spacingY + spacingY*2;
  });

  console.log(graph);

  var svg = d3.select('#explo')
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h)

  // range input event
  d3.select("#zoom").on("input", function() {
    spacingX = this.value;
    update();
  });

  // var s = graph.linksPeriod.start;
  // var e = graph.linksPeriod.end;

  // dateFormat = d3.format('04d'),
  // timeToPos = d3.scale.linear().domain([s, e]).range([0, w]),
  // timeScale = d3.time.scale().domain([s, e]).range([0, w]).nice(),
  // timeAxis = d3.svg.axis(timeScale).scale(timeToPos).tickSize(100).orient( "left" )
  // .ticks((e-s) / 2).tickFormat(dateFormat);


  // draw viz at launch
  create();

  // attributes formulas
  function sourceY(d){ return eventPosY[d.source.recordId] }
  function targetY(d){ return eventPosY[d.target.recordId] }
  function linkX(d,i){
    return offsetX + d.rank * spacingX
      // + ((d.startDate-graph.linksPeriod.start) * spacingYear)

  } // index event per target i >
  function linkTypeColor(d){return color(_.indexOf(Sutils.getTypes(data,{'recordTypeId':1}), d.typeId));}

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

  // time axis
    // svg.append('g')
    //   .attr('class', 'timeAxis taxis')
    //   .call(timeAxis);

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
      .attr('y', function(d){return eventPosY[d.recordId]})
      .attr('transform', 'translate(0, 4)')
      .text(function(d){return d.shortName})
      .style('color',linkTypeColor)
      .append('title')
      .text(function(d) { return d.typeName})


    list.append('line')
      .attr('x1', 100)
      .attr('y1', function(d){return eventPosY[d.recordId]})
      .attr('x2', w)
      .attr('y2', function(d){return eventPosY[d.recordId]})
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
      .attr('transform', 'translate(' + 5 + ',' + 0 + ')')
      .attr('text-anchor', 'left');

    // year mark
    event.append('line')
      .attr('class', 'yearMark')
      .attr('y1', 0)
      .attr('y2', h)

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
      .attr('r', 4)
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);

    // target node
    event.append('circle')
      .attr('class','node target')
      .attr('cy', targetY)
      .style('fill', linkTypeColor)
      .attr('r', 4)
      .on('mouseover', focusOn)
      .on('mouseout', focusOff);




    // var axis =svg.append('g')
    //   .data(years)
    //   .enter();

    //   // year label
    //   axis.append('text')
    //     // .attr('class', 'yearLabel')
    //     .text(function(y){return y})
    //     .attr('text-anchor', 'middle');

    //   // year mark
    //   axis.append('line')
    //     // .attr('class', 'yearMark')
    //     .attr('y1', function(y){return (15+ (y%6) * 10)})
    //     .attr('y2', h)


    update();
  }

  // update attributes
  function update(){

    // year label
    d3.selectAll('.yearLabel')
      .attr('x',linkX)
      .attr('y', function(d,i){ return 10+ (d.startDate%4) * 10})

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



