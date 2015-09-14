var apiUrl = 'http://heurist.sydney.edu.au/h4-ao/h3/viewers/smarty/showReps.php?db=meder_test_to_delete&w=a&q=t:1%20OR%20t:4%20OR%20t:14%20sortby:rt&publish=1&debug=0&template=JSON-structured.tpl';
var apiUrl = 'data/heurist-cache.json';

var w = 1800,
    h = 2100,
    r = 6,
    fill = d3.scale.category10(),
    timeBegin = 1945,
    timeEnd = 2010,
    radius = 15,
    m = [ 50 , 30, 30, 30 ],
    lineHeight = 80,
    lineCount = 14,
    boxWidth = 250
    ;


var svg = d3.select("body").append("svg:svg")
    .attr("width", w + m[1] + m[3] )
    .attr("height", h + m[0] + m[2]);

d3.json(apiUrl, function(error, data) {
  var graph =  {
    organisations:_(data).filter('recordTypeId', 4).forEach(function(o){o.hasLink = false;}).sortBy('typeId').value(),
    relations: _(data)
                .filter('recordTypeId', 1)
                .filter(function(r){
                    return r.source.recTypeId === 4 && r.target.recTypeId === 4;
                })
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

  if (error) throw error;



  var nodesG = svg.selectAll("organisations")
      .data(graph.organisations)
      .enter()
      .append("g")
        // .filter(function(d){ return d.hasLink; })
        .attr("transform", function(o,i) {
          return "translate("+
              ( boxWidth * (Math.floor(i/lineCount) ) + 400 ) +','+
              (lineHeight + i%lineCount*lineHeight) +")"
        })
        ;

      nodesG.append("rect")
        .attr('width', boxWidth )
        .attr('height', lineHeight)
        .attr('x', -lineHeight / 2 )
        .attr('y', -lineHeight / 2 )
        .attr('fill','none' )
        .attr('stroke','black' )
        .attr('class', 'box')
        ;

      nodesG.append('circle')
        .style("fill",function(o){return fill(_.indexOf(organisationsTypes, o.typeId));})
        .attr('r',10)
        .attr('cy', -5)
        ;

      nodesG.append("text")
        .style("fill",function(o){return fill(_.indexOf(organisationsTypes, o.typeId));})
        .attr('x', 20)
        .text(function(d) { return d.shortName; })
        ;

  var relTypeCaption = svg.selectAll(".relTypeCaption")
      .data(relationsTypes)
      .enter()
      .append("text")
      .attr('class','relTypeCaption' )
      .attr('y', function(t,i){return i*lineHeight/3})
      .text(function(t){
        var r = _(graph.relations).find('typeId', t);
        if(r != undefined) return "→ " + r.typeName + " ("+r.typeId+") → "
      })
      .attr("transform", "translate(20,400)")
      .attr('fill', function(t){ return fill(_.indexOf(relationsTypes, t))})
      ;

  var orgaTypeCaption = svg.selectAll(".orgaTypeCaption")
      .data(organisationsTypes)
      .enter()
      .append("text")
      .attr('x', 0)
      .attr('y', function(t,i){return i*lineHeight/3})
      .attr("transform", "translate( 20,30)")
      .text(function(t){
        var o = _(graph.organisations).find('typeId', t);
        return o.typeName + " ("+o.typeId+") "
      })
      .attr('fill', function(t){ return fill(_.indexOf(organisationsTypes, t))})
      ;
  var issuesCaption = svg.selectAll('.issue')
    .data(graph.issues).enter()
    .append('text')
    .attr('x', 0 )
    .attr('y', function(d,i){return i*lineHeight/3})
    .attr('transform', 'translate( 20,650)')
    .text(function(d,i){ return d.recordId + ' — ' + d.title; })
    .attr('class', 'issue')
    .attr('fill', 'black' )
    ;

});
