var apiUrl = 'http://heurist.sydney.edu.au/h4-ao/h3/viewers/smarty/showReps.php?db=meder_test_to_delete&w=a&q=t:1%20OR%20t:4%20OR%20t:14%20sortby:rt&publish=1&debug=0&template=JSON-structured.tpl';
var apiUrl = '/data/heurist-cache.json';

d3.json(apiUrl, function(error, data) {


  console.log(_.pluck(_.sortBy(data, 'recordId'), 'recordId'))

  var graph =
  {
    organisations:  _.filter(data, 'recordTypeId', 4),
    relations:  _.filter(data, 'recordTypeId', 1),
    issues: _.filter(data, 'recordTypeId', 14)
  };

  console.log(graph.organisations);
  console.log(graph.relations);

  console.log(_.pluck(_.sortBy(graph.organisations, 'recordId'), 'recordId'));

  const palette =  _.shuffle(["#D5B7A3","#70F6B5","#EEE96A","#5ED6EE","#D0A2DC","#F09C5D","#98C496","#B0EB8C","#DCEEE4","#D2BC6F","#F093B5","#ECCEE2","#9BB4EE","#44F0D5","#F29D84","#EEDEAA","#9CB6A8","#C0DAF1","#56CBA2","#ABA8C5","#4FC7C5","#E9A6A5","#A5C373","#BFE36A","#E2E797","#E5B856","#7DBFE2","#7FD990","#E3AF76","#C7EFBA","#BABC8E","#92E7C3","#C8C559","#C4B2B4","#D7A2C6","#8ABCCA","#E5E1C1","#7FE6D9","#BFCDCC","#EDE0DB","#84E8EE","#F3ACC4","#8BC4B6","#EFBCEE","#B5BAE6","#B4BC9F","#BEECDD","#C8B97D","#DAB692","#C1BCD8"]);
  var color = d3.scale.category20();

  // get all relation type
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


  var w = 1500,
      h = 2000


  var svg = d3.select('body')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'container-fluid');


  var timeBegin = 1920;
  var timeEnd = 2015;
  var m = [50,150,50,50];

  var lineHeight = 20;
  var lineMargin = 3;

  var x = d3.scale.linear()
      .domain([timeBegin, timeEnd])
      .range([m[3] , w - m[1] ]);

  svg.append('g').selectAll('.orgaLine')
    .data(_.sortBy(graph.organisations, 'startDate'))
    .enter()
    .append('rect')

    .attr('class', 'orgaLine')
    .attr('id', function(d){ return "record"+d.recordId} )

    .attr('x', function(d) { return x(d.startDate) ;})
    .attr('y', function(d, i) {return i*lineHeight;})

    .attr('width', function(d) {
      if(d.endDate - d.startDate > 0) return x(timeBegin + d.endDate - d.startDate);
      else return  x(timeBegin + timeEnd - d.startDate);
    })
    .attr('height', lineHeight - lineMargin)
    .style("fill",function(o){return color(_.indexOf(organisationsTypes, o.typeId));})
    ;

  svg.append('g').selectAll('relations')
    .data(_.filter(graph.relations,function(r) { return r.source.recTypeId === 4 && r.target.recTypeId === 4;}))
    .enter()
    .append('polyline')
    .attr('class','relations')
    .style("stroke",function(r){return color(_.indexOf(relationsTypes, r.typeId));})
    .attr('points', function(d){

      var s = _.find(graph.organisations, 'recordId', d.source.id);
      var t = _.find(graph.organisations, 'recordId', d.target.id);

      // console.log(d, "#record"+d.source.id, "s",s,"t",t);
        if( s && t ){
          var p =  {
            sx : parseInt(d3.select("#record"+d.source.id).attr("x"))+ parseInt(d3.select("#record"+d.source.id).attr("width")),
            sy : parseInt(d3.select("#record"+d.source.id).attr("y")),
            tx : parseInt(d3.select("#record"+d.target.id).attr("x")),
            ty : parseInt(d3.select("#record"+d.target.id).attr("y"))
          }

          var moveX =  Math.random() * 50;
          var moveY =  Math.random() * lineHeight -3;

          return p.sx +"," + (p.sy + moveY)  + " "
              +  (p.sx + moveX) +"," + (p.sy + moveY) + " "
              +  (p.sx - 80 + moveX) +"," + (p.ty + moveY) + " "
              +  p.tx +"," + (p.ty + moveY);

        }else{
          console.log(d);
        }
      })
    ;

  svg.append('g').selectAll('.label')
    .data(_.sortBy(graph.organisations, 'startDate'))
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', function(d) { return x(d.startDate) + lineMargin ;})
    .attr('y', function(d, i) {return i * lineHeight + 12 ;})
    .text(function(d) { return d.shortName})
    ;

  var orgaTypeCaption = svg.selectAll(".orgaTypeCaption")
      .data(organisationsTypes).enter()
      .append("text")
      .attr('x', 0)
      .attr('y', function(t,i){return (i + 4)*20})
      .text(function(t){
        var o = _(graph.organisations).find('typeId', t);
        return o.typeName
      })
      .attr('fill', function(t){ return color(_.indexOf(organisationsTypes, t))})
      ;

  var relTypeCaption = svg.selectAll(".relTypeCaption")
      .data(relationsTypes).enter()
      .append("text")
      .attr('x', 300)
      .attr('y', function(t,i){return (i + 4)*20})
      .text(function(t){
        var r = _(graph.relations).find('typeId', t);
        if(r != undefined) return r.typeName
      })
      .attr('fill', function(t){ return color(_.indexOf(relationsTypes, t))})
      ;


});

