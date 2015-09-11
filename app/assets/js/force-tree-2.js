// const apiUrl = 'http://heurist.sydney.edu.au/h4-ao/h3/viewers/smarty/showReps.php?db=meder_test_to_delete&w=a&q=t:1%20OR%20t:4%20OR%20t:14%20sortby:rt&publish=1&debug=0&template=JSON-structured.tpl';
const apiUrl = 'data/heurist-cache.json';

const
  w = 1500,
  h = 2500,
  r = 6,

  timeBegin = 1945,
  timeEnd = 2020,
  radius = 15,

  m = [50,30,30,30],

  palette =  ["#D54B32","#736ACB","#56B23A","#549DAB","#495F2C","#CB3A72","#554E71","#C58939","#CF53D5","#854032","#55A877","#AD569D","#97A33D","#8C96CE","#D17986"],
  colorCustom = d3.scale.ordinal().range(palette),
  color10 = d3.scale.category10(),

  xTime = d3.scale.linear()
    .domain([timeBegin, timeEnd])
    .range([0, w])
    ,

  formatAsDate = d3.format("04d"),
  xTimeAxis = d3.time.scale()
    .domain([timeBegin, timeEnd])
    .range([0, h])
    .nice()
    ,
  xAxis = d3.svg.axis(xTimeAxis)
    .scale(xTime)
    .tickSize(w)
    .ticks((timeEnd-timeBegin) / 2)
    .tickFormat(formatAsDate)
    ,

  force = d3.layout.force(0)
    .charge(-1500)
    .linkDistance(150)
    .size([w, h])
    ,

  svg = d3.select("body").append("svg:svg")
    .attr("width", w + m[1] + m[3] )
    .attr("height", h + m[0] + m[2])

  ;

d3.json(apiUrl, function(error, data) {

  if (error) throw error;

  var graph =  {
    organisations:_(data)
      .filter('recordTypeId', 4)
      .forEach(function(o){

        o.hasLink = false;

        if(o.startDate === undefined) o.startDate = timeBegin;
        if(o.endDate === 1970 || o.endDate === undefined) o.endDate = timeEnd-5;
      })
      .value()
      ,
    relations: _(data)
      .filter('recordTypeId', 1)
      .filter(function(r){ return r.typeId !== undefined
          && r.typeId !== 5091
          && r.typeId !== 5151
          && r.typeId !== 5177
          && r.typeId !== 5261
      })
      .filter(function(r){ return r.source.recTypeId === 4 && r.target.recTypeId === 4;})
      .value()
      ,
    issues: _.filter(data,'recordTypeId', 14)
  };
  var organisationsTypes = _(graph.organisations)
      .sortBy('typeId').pluck('typeId').uniq()
      .filter(function(o){ return ! _.isUndefined(o)})
      .sortBy('recordTypeName')
      .value()
      ;
  var relationsTypes = _(graph.relations)
      .sortBy('typeId').pluck('typeId').uniq()
      .filter(function(o){ return ! _.isUndefined(o)})
      .value()
      ;

  graph.relations = _(graph.relations).filter(function(r){

      if(r.startDate === undefined) r.startDate = timeBegin;

      var s = _.find(graph.organisations, 'recordId', r.source.id);
      var t = _.find(graph.organisations, 'recordId', r.target.id);

      sIndex = _.indexOf(graph.organisations,s);
      tIndex = _.indexOf(graph.organisations,t);

      if(sIndex < 0) console.log("source missing", r.recordId, r.source.id, sIndex);
      if(tIndex < 0) console.log("target missing", r.recordId, r.target.id, tIndex);

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
    }).value()
    ;
  console.log(graph.relations);
  console.log(graph.organisations);
  console.log("organisationsTypes:",organisationsTypes);
  console.log("relationsTypes:",relationsTypes);

  var links = svg.selectAll("link")
      .data(graph.relations)
      .enter()
      .append("svg:line")
      .attr('class','link' )
      .attr('id', function(r){ return 'r-'+r.recordId+'_'+ r.typeId })
      .attr("marker-start", "url(#arrow)")
      .style("stroke",function(r){return color10(_.indexOf(relationsTypes, r.typeId));})
      .attr('stroke-linecap', 'round')
      ;

  var orgas = svg.selectAll("organisations")
      .data(graph.organisations)
      .enter()
      .append("svg")

//      .filter(function(d){ return d.hasLink; })

      .attr('class', function(d){ return d.hasLink ? '' : 'nolink'; })
      .attr('height', "100" )
      .attr("x", function(d) { return xTime(d.startDate); })

      orgas.append("text")
      .style("fill",function(o){return colorCustom(_.indexOf(organisationsTypes, o.typeId));})
      .attr("transform", "translate(0,15)")
      .text(function(d) { return d.shortName; })

      orgas.append("rect")
      .style("fill",function(o){return colorCustom(_.indexOf(organisationsTypes, o.typeId));})
      .attr('width' , function(d) {return xTime(d.endDate) - xTime(d.startDate) })
      .attr('height', function(d) { return  3 })

      orgas.call(force.drag)
      ;

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
      .attr('fill', function(t){ return color10(_.indexOf(relationsTypes, t))})
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
      .attr('fill', function(t){ return colorCustom(_.indexOf(organisationsTypes, t))})
      ;

  svg.append("svg:defs").selectAll("marker")
    .data(["arrow"])
    .enter()
    .append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "-20 -20 40 40")
    .attr("refX", 0)
    .attr("refY", 0)
    .attr("orient", "auto")
    .style("fill", "red")
    .append("svg:path")
    .attr("d", "M2,2 L2,11 L10,6 L2,2");

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(xAxis);


  force
      .nodes(graph.organisations)
      .links(graph.relations)
      .on("tick", tick)
      .start();

  function tick(e) {

    orgas.attr("y", function(d) { return d.y = Math.max(radius, Math.min(h - radius, d.y))})

    links.attr("x1", function(d) { return Math.max( xTime(d.source.startDate) , xTime(d.startDate) ) - xTime(timeBegin + 0.5);})
        .attr("y1", function(d) { return d.source.y  ; })
        .attr("x2", function(d) { return Math.min( xTime(d.target.startDate) ,  xTime(d.target.endDate) ); })
        .attr("y2", function(d) { return d.target.y ; });
  }
});
