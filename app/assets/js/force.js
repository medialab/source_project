var apiUrl = '/data/heurist-cache.json';

var width = 1280,
    height = 720;

var nodeColor = d3.scale.category20();
var linkColor = d3.scale.category10();

var force = d3.layout.force()
    .charge(-150)
    .linkDistance(100)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json(apiUrl, function(error, data) {
  var graph =  {
    organisations:_.filter(data,'recordTypeId', 4),
    relations:    _(data)
                    .filter('recordTypeId', 1)
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
      .sortBy('orgaTypeId')
      .pluck('orgaTypeId')
      .uniq()
      .filter(function(o){ return ! _.isUndefined(o)})
      .value()
      ;

  var relationsTypes = _(graph.relations)
      .sortBy('typeInternalId')
      .pluck('typeInternalId')
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

  force
      .nodes(graph.organisations)
      .links(graph.relations)
      .start()
      ;

  var link = svg.selectAll(".link")
      .data(graph.relations)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", 10)
      .style("stroke",function(r){return linkColor(_.indexOf(relationsTypes, r.typeInternalId));})
      ;

  var node = svg.selectAll(".node")
      .data(graph.organisations).enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 10)
      .style("fill",function(o){return nodeColor(_.indexOf(organisationsTypes, o.orgaTypeId));})
      .call(force.drag)
      ;

  node.append("title")
      .text(function(d) { return d.name; })
      ;

  var orgaTypeCaption = svg.selectAll(".orgaTypeCaption")
      .data(organisationsTypes).enter()
      .append("text")
      .attr('x', 0)
      .attr('y', function(t,i){return i*20})
      .text(function(t){
        var o = _(graph.organisations).find('orgaTypeId', t);
        return o.orgaType
      })
      .attr('fill', function(t){ return nodeColor(_.indexOf(organisationsTypes, t))})
      ;

  var relTypeCaption = svg.selectAll(".relTypeCaption")
      .data(relationsTypes).enter()
      .append("text")
      .attr('x', 300)
      .attr('y', function(t,i){return i*20})
      .text(function(t){
        var r = _(graph.relations).find('typeInternalId', t);
        if(r != undefined) return r.typeName
      })
      .attr('fill', function(t){ return linkColor(_.indexOf(relationsTypes, t))})
      ;

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        ;

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        ;
  });
});
