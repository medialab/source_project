const apiUrl = 'data/heurist-cache.json';


d3.json(apiUrl, function(error, data) {

  if (error) throw error;

  var graph =  {};

  var so = new Source(data);

  // list of elements to link

  // // list relations
  console.log(so.getValidRel());

  // // list administration
  graph.org = _(data)
    .filter('recordTypeId', 4)
    .reject('typeId', 5314)
    .value()
    ;

  console.log(
      so.getTypes({'recordTypeId':4})
  );

  // list states
  graph.sta = _(data)
    .filter('typeId', 5314) // states
    .value()
    ;

  // list documents
  graph.doc = _(data)
    .filter('recordTypeId', 13)
    .value()
    ;

  graph.treaty = _(data)
    .where({'typeId':5319})
    .forEach(function(d){
      d.childEvents = so.getTimedLinks(d, {'typeId':5333, 'typeId':5331, 'typeId':5344});
    })
    .value()
    ;
  console.log(graph.treaty);
})
