var config  = {}, g = {};

d3.json('../config.json', function(error, config){
  g.conf = config;
  g.corpus = _(config.corpus).filter(function(value, key) {return key === corpusId;}).first();
  g.layout = typeof g.corpus.layout !== 'undefined' ? g.corpus.layout : {};
  d3.json('data/'+g.corpus.template+'_'+ corpusId +'.json', onData);
});

function onData (data) {

  var data = data.results;

  var l = _.defaults(g.layout, g.conf.layout);

  g.links = Sutils.getValidLinks(data, g.conf, l);
  g.nodes = Sutils.getLinkedNodes(data, g.links, l);

  g.issues = _(g.nodes).filter('recordTypeId',14).value();
  g.devices = _(g.nodes).filter('recordTypeId',16).value();

  // min-max date
  g.linksPeriod = Sutils.getTimeBounds(g.links)

  g.links = _(g.links).forEach(function(d){
    if(_.isUndefined(d.endDate)) d.endDate = g.linksPeriod.end;  
    if(d.endDate > 9000) d.endDate = g.linksPeriod.end;
  })
  .filter('typeId', 5158)
  .value()

  var deviceWithIssue = _(g.issues).map(function(i){
    return _(g.links)
      .filter(function(l){
        return l.target.recordId === i.recordId;
      })
      .map(function(l){
        return _.defaults(
          l.target, {
            startDate:l.startDate,
            endDate:l.endDate
        })
      }).value()
  }).value()

  g.table = _(g.devices).forEach(function(d){

    d.byDate = _(_.range(g.linksPeriod.start, g.linksPeriod.end)).map(function(y){ 
      return {'year':y, 'issues':[]}})
    .indexBy('year')
    .value();

    _(g.links)
      .filter(function(l){return l.source.recordId === d.recordId;})
      .forEach(function(l){
        for (var i = l.startDate; i < l.endDate; i++) {
          d.byDate[i].issues.push(l.target)
        };
      }).value()

  }).value()
  draw(g);
}

function draw(g){

  var width = 1000 , height = 400, spacingX = 30, spacingY = 12, m = [50, 10];
  var color = d3.scale.category20();
  var svg = d3.select('#profile').append('svg:svg').attr('width', width).attr('height', height);

  var issuesBydevice = d3.nest()
    .key(function (d) { return d.source.shortName})
    .entries(g.links);



  console.log("issuesBydevice", issuesBydevice);

  var issuesInDeviceNested = [];
  issuesBydevice[15].values.forEach(function (d) {
    issuesInDeviceNested.push({
      key: issuesBydevice[15].key,
      endDate:d.endDate, 
      startDate:d.startDate, 
      shortName:d.target.shortName})

  })

  console.log("issuesInDeviceNested", issuesInDeviceNested);

  var issuesInDeviceDetails = [];
  issuesInDeviceNested.forEach(function (d) {
    // if (d.startDate > g.linksPeriod.start) {
    //   for (var i = g.linksPeriod.start; i < d.endDate; i++) {
    //   issuesInDeviceDetails.push({key: d.shortName, value: 1, date: i})
    //   }
    // }
    for (var i = d.startDate; i < d.endDate; i++) {
      issuesInDeviceDetails.push({key: d.shortName, value: 1, date: i})
    }
  })

  // console.log("issuesInDeviceDetails", issuesInDeviceDetails);


  chart(issuesInDeviceDetails, "orange");

var datearray = [];
var colorrange = [];


  function chart(data, color) {


  /*
   * color choices
   */

  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
    colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "orange") {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  }
  strokecolor = colorrange[0];

  var format = d3.time.format("%y");

  /*
   * svg config
   */
  // var margin = {top: 20, right: 40, bottom: 30, left: 30};
  // var width = document.body.clientWidth - margin.left - margin.right;
  // var height = 400 - margin.top - margin.bottom;

  /*
   * tooltip to display info
   */ 

  var tooltip = d3.select("body")
      .append("div")
      .attr("class", "remove")
      .style("position", "absolute")
      .style("z-index", "20")
      .style("visibility", "hidden")
      .style("top", "30px")
      .style("left", "55px");

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height-10, 0]);

  var z = d3.scale.ordinal()
      .range(colorrange);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(4);

  var yAxis = d3.svg.axis()
      .scale(y);

  var yAxisr = d3.svg.axis()
      .scale(y);

  var stack = d3.layout.stack()
      .offset("silhouette")
      .values(function(d) { 
        if (d !== undefined) 
          return d.values; 
      })
      .x(function(d) { 
        if (d !== undefined)
          return d.date; 
      })
      .y(function(d) { 
        if (d !== undefined)
         return d.value; 
      });

  var nest = d3.nest()
      .key(function(d) { return d.key; });

  var area = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.y0); })
      .y1(function(d) { return y(d.y0 + d.y); });

  // var svg = d3.select(".chart").append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //   .append("g")
  //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var graph = d3.csv(data, function(data) {
    data.forEach(function(d) {
      console.log("d", d);
      // d.date = format.parse(d.date);
      d.date = d.date;
      // console.log("date", d.date);
      d.value = +d.value;
      console.log("value", d.value);
    });

    console.log("data", data);
    var layers = stack(nest.entries(data));

    console.log("layers", layers);

    /*
     * Axis config
     */

    // x.domain(d3.extent(data, function(d) { return d.date; }));
    x.domain([1951, 2013]);
    y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

    svg.selectAll(".layer")
        .data(layers)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return z(i); });


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxis.orient("right"));

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis.orient("left"));

    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 0.6 : 1;
      })})

      .on("mousemove", function(d, i) {
        console.log("d", d);
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        invertedx = invertedx.getMonth() + invertedx.getDate();
        var selected = (d.values);
        for (var k = 0; k < selected.length; k++) {
          datearray[k] = selected[k].date
          //datearray[k] = datearray[k].getDate();
        }

        mousedate = datearray.indexOf(invertedx);
        // pro = d.values[mousedate].value;

        d3.select(this)
        .classed("hover", true)
        .attr("stroke", strokecolor)
        .attr("stroke-width", "0.5px"), 
        tooltip.html( "<p>" + d.key + "<br>" + d.value + d.date +  "</p>" ).style("visibility", "visible");
        
      })
      .on("mouseout", function(d, i) {

       svg.selectAll(".layer")
        .transition()
        .duration(250)
        .attr("opacity", "1");
        d3.select(this)
        .classed("hover", false)
        .attr("stroke-width", "0px"), tooltip.html( "<p>" + d.key + "<br>" + d.date +  "</p>" ).style("visibility", "hidden");
    })

    /*
     * Vertical line
     */
      
    var vertical = d3.select("#profile")
          .append("div")
          .attr("class", "remove")
          .style("position", "absolute")
          .style("z-index", "19")
          .style("width", "1px")
          .style("height", "380px")
          .style("top", "10px")
          .style("bottom", "30px")
          .style("left", "0px")
          .style("background", "#fff");

    /*
     * Mouse interactions
     */

    d3.select("#profile")
        .on("mousemove", function(){  
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){  
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px")});
  // });

  }

}
