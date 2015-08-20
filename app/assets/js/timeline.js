var apiUrl = "http://heurist.sydney.edu.au/h4-ao/h3/viewers/smarty/showReps.php?db=meder_test_to_delete&w=a&q=t:1%20OR%20t:4%20OR%20t:14%20sortby:rt&publish=1&debug=0&template=JSON-structured.tpl";
var apiUrl = "/data/heurist-cache.json";

d3.json(apiUrl, function(error, data) {

  var graph =
  {
    organisations:  _.filter(data, 'recordTypeId', 4),
    relations:  _.filter(data, 'recordTypeId', 1),
    issues: _.filter(data, 'recordTypeId', 14)
  };


  console.log(_.pluck(_.sortBy(graph.organisations, 'startDate'), 'startDate'));
  console.log(_.pluck(_.sortBy(graph.organisations, 'endDate'), 'endDate'));

  var w = 1000,
      h = 900



  var svg = d3.select('body')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'container');


  var timeBegin = 1945;
  var timeEnd = 2015;

  var x = d3.scale.linear()
      .domain([timeBegin, timeEnd])
      .range([0, w]);

  svg.append("g").selectAll(".laneLines")
    .data(_.sortBy(graph.organisations, 'startDate'))
    .enter()
    .append("rect")

    .attr("class", "itemOrga")

    .attr("x", function(d) { return x(parseInt(d.startDate)) ;})
    .attr("y", function(d, i) {return i*5;})

    .attr("width", function(d) {

      if(parseInt(d.endDate)) { return x(parseInt(d.endDate) - parseInt(d.startDate));}
      else { return 200 ;}

    })
    .attr("height", 3);

});

