var apiUrl = 'http://heurist.sydney.edu.au/h4-ao/h3/viewers/smarty/showReps.php?db=meder_test_to_delete&w=a&q=t:1%20OR%20t:4%20OR%20t:14%20sortby:rt&publish=1&debug=0&template=JSON-structured.tpl';
var apiUrl = 'data/heurist-cache.json';

var w = 1500,
    h = 1000,
    r = 6,
    fill = d3.scale.category10(),
    timeBegin = 1945,
    timeEnd = 2010,
    m = [ 50 , 30, 30, 30 ];


var

  y = d3.scale.linear()
    .domain([timeBegin, timeEnd])
    .range([0, h])
    ,

  yTime = d3.time.scale()
    .domain([timeBegin, timeEnd])
    .range([0, h])
    .nice()
    ,

  yAxis = d3.svg.axis(yTime)
    .scale(y)
    .tickSize(w)
    .orient("right")
    ,

  force = d3.layout.force()
    .charge(-1000)
    .linkDistance(150)
    .size([w, h]);

  svg = d3.select("body").append("svg:svg")
    .attr("width", w + m[1] + m[3] )
    .attr("height", h + m[0] + m[2]);

d3.json(apiUrl, function(error, data) {
  var graph =  {
    organisations:_(data).filter('recordTypeId', 4).forEach(function(o){o.hasLink = false;}).value(),
    relations: _(data)
                .filter('recordTypeId', 1)
                // .filter(function(r){

                //   5150 — creates
                //   5151 — is created by
                //   5177 — is integrated in
                //   5260 — transforms into
                //   5261 — follows from

                //   return r.typeId === 5150
                //     || r.typeId === 5260
                //     || r.typeId === 5177
                //     || r.typeId === 5261
                //     ;
                // })
                .filter(
                  function(r){
                    return r.source.recTypeId === 4 && r.target.recTypeId === 4;
                  }
                )
                .value()
                ,
    issues: _.filter(data,'recordTypeId', 14)
  };

  var organisationsTypes = _(graph.organisations)
      .sortBy('typeId')
      .pluck('typeId')
      .uniq()
      .filter(function(o){ return ! _.isUndefined(o)})
      .sortBy('recordTypeName')
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
        return false;
      } else {
        r.source = sIndex;
        r.target = tIndex;
        r.value = 2;

        s.hasLink = true;
        t.hasLink = true;
        return true;
      }
    })
    .value()
    ;
  console.log(graph.relations);
  console.log(graph.organisations);
  console.log("organisationsTypes:",organisationsTypes);
  console.log("relationsTypes:",relationsTypes);

svg.append("svg:defs").selectAll("marker")
    .data(["arrow"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -25 25 25")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("orient", "auto")
            .style("fill", "red")
    .append("svg:path")


    .attr("d", "M0,-5L10,0L0,0");


  if (error) throw error;
  var link = svg.selectAll("link")
      .data(graph.relations)
    .enter()
    .append("svg:line")
    .attr('class','link' )
    .attr("marker-end", "url(#arrow)")
    .style("stroke",function(r){return fill(_.indexOf(relationsTypes, r.typeId));})

    ;

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate( " + (-100) + ",0)")
      .call(yAxis);

  var node = svg.selectAll("organisations")
      .data(graph.organisations)
    .enter().append("text")
      .attr("class", function(o){ return o.hasLink ? '' : 'hide'})
      .style("fill",function(o){return fill(_.indexOf(organisationsTypes, o.typeId));})
      .attr("y", function(d) { return y(d.startDate); })
      .text(function(d) { return "⬣ "+d.shortName; })
      .call(force.drag);

  var relTypeCaption = svg.selectAll(".relTypeCaption")
      .data(relationsTypes).enter()
      .append("text")
      .attr('class','relTypeCaption' )
      .attr('y', function(t,i){return i*20})
      .text(function(t){
        var r = _(graph.relations).find('typeId', t);
        if(r != undefined) return r.typeId + " — " +  r.typeName
      })
      .attr("transform", "translate( 300,30)")
      .attr('fill', function(t){ return fill(_.indexOf(relationsTypes, t))})
      ;
  var orgaTypeCaption = svg.selectAll(".orgaTypeCaption")
      .data(organisationsTypes).enter()
      .append("text")
      .attr('x', 0)
      .attr('y', function(t,i){return i*20})
      .attr("transform", "translate( 20,30)")
      .text(function(t){
        var o = _(graph.organisations).find('typeId', t);
        return o.typeId + " — " + o.typeName
      })
      .attr('fill', function(t){ return fill(_.indexOf(organisationsTypes, t))})
      ;

  force
      .nodes(graph.organisations)
      .links(graph.relations)
      .on("tick", tick)
      .start();

  function tick(e) {

    var k = 6 * e.alpha;
    graph.relations.forEach(function(d, i) {
      d.source.y -= k;
      d.target.y += k;
    });

    node.attr("x", function(d) { return d.x; })

    link.attr("x1", function(d) { return d.source.x + 6; })
        .attr("y1", function(d) { return y(d.source.startDate) - 6 ; })
        .attr("x2", function(d) { return d.target.x + 6; })
        .attr("y2", function(d) { return y(d.target.startDate) - 6 ; });
  }
});
