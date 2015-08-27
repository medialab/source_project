var apiUrl = 'http://heurist.sydney.edu.au/h4-ao/h3/viewers/smarty/showReps.php?db=meder_test_to_delete&w=a&q=t:1%20OR%20t:4%20OR%20t:14%20sortby:rt&publish=1&debug=0&template=JSON-structured.tpl';
var apiUrl = 'data/heurist-cache.json';

var w = 1200,
    h = 1000,
    r = 6,
    fill = d3.scale.category20();

  var timeBegin = 1920;
  var timeEnd = 2015;


  var y = d3.scale.linear()
      .domain([timeBegin, timeEnd])
      .range([0, h]);

var force = d3.layout.force()
    .charge(-200)
    .linkDistance(200)
    .size([w, h]);

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.json(apiUrl, function(error, data) {
  var graph =  {
    organisations:_.filter(data,'recordTypeId', 4),
    relations:    _(data)
                    .filter('recordTypeId', 1)
                    // .filter('typeId', 5090)
                    .filter(
                      function(r){
                        return r.source.recTypeId === 4 && r.target.recTypeId === 4;
                      }
                    )
                    .value()
                    ,
    issues:       _.filter(data,'recordTypeId', 14)
  };

  var organisationsTypes = _(graph.organisations)
      .sortBy('typeId')
      .pluck('typeId')
      .uniq()
      .filter(function(o){ return ! _.isUndefined(o)})
      .value()
      ;

  var relationsTypes = _(graph.relations)
      .sortBy('typeId')
      .pluck('typeId')
      .uniq()
      .filter(function(o){ return ! _.isUndefined(o)})
      .value()
      ;

  graph.relations = _(graph.relations)
    .filter(function(r){

      var s = _.find(graph.organisations, 'recordId', r.source.id);
      var t = _.find(graph.organisations, 'recordId', r.target.id);

      sIndex = _.indexOf(graph.organisations,s);
      tIndex = _.indexOf(graph.organisations,t);

      if(sIndex < 0) console.log("source missing",r.recordId, r.source.id, sIndex);
      if(tIndex < 0) console.log("target missing",r.recordId, r.target.id, tIndex);

      if(sIndex < 0 || tIndex < 0){
        // console.log(r.source.id,sIndex,"->",r.target.id,tIndex);
        return false;
      } else {
        r.source = sIndex;
        r.target = tIndex;
        r.value = 2;
        return true;
      }
    })
    .value()
    ;
  console.log(graph.relations);
  console.log(graph.organisations);
  console.log("organisationsTypes:",organisationsTypes);
  console.log("relationsTypes:",relationsTypes);

  if (error) throw error;
  var link = svg.selectAll("line")
      .data(graph.relations)
    .enter()
    .append("svg:line")
    .style("stroke",function(r){return fill(_.indexOf(relationsTypes, r.typeId));})
    ;

  var node = svg.selectAll("circle")
      .data(graph.organisations)
    .enter().append("svg:circle")
      .attr("r", r)
      .style("fill",function(o){return fill(_.indexOf(organisationsTypes, o.typeId));})
      .style("stroke", function(d) { return d3.rgb(fill(d.group)).darker(); })
      .attr("cy", function(d) { return y(d.startDate); })
      .call(force.drag);


  force
      .nodes(graph.organisations)
      .links(graph.relations)
      .on("tick", tick)
      .start();

  function tick(e) {

    // Push sources up and targets down to form a weak tree.
    var k = 6 * e.alpha;
    graph.relations.forEach(function(d, i) {
      d.source.y -= k;
      d.target.y += k;
    });

    node.attr("cx", function(d) { return d.x; })

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return y(d.source.startDate); })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return y(d.target.startDate); });
  }
});
