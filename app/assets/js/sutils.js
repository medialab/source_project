(function() {

  if(typeof window === 'undefined' ) _ = require('lodash');

  Sutils = {}

  // nest
  // https://gist.github.com/joyrexus/9837596
  Sutils.nest = function (seq, keys) {
    if (!keys.length)
        return seq;
    var first = keys[0];
    var rest = keys.slice(1);
    return _.mapValues(_.groupBy(seq, first), function (value) {
        return Sutils.nest(value, rest)
    });
  };

  //
  Sutils.dataCheck = function(data){

    var r = {}; // report
    var fields = ['startDate','endDate','shortName','source','target'];

    _.forEach(fields, function(f){

        var und = _.filter(data, function(d){ return _.isUndefined(d[f]) });
        r['undefined-'+f]= Sutils.nest(und, ['recordTypeName','typeName']);

    })
    // types
    r.recordsByTypes = Sutils.nest(data, ['recordTypeName',function(d){
      return d.typeId+': ' + d.typeName ;
    }])

    return r;
  }
  // get all recordId
  Sutils.getAllRecId = function(data){
    return _(data).map('recordId').value();
  };

  // get dates
  Sutils.getDates = function(data){
   return _(data)
      .map('startDate')
      .uniq()
      .sortBy()
      .reject(_.isUndefined)
      .value();
  };

  // get time limits
  Sutils.getTimeBounds = function(data){
    return {
      'start':_.first(Sutils.getDates(data)),
      'end': _.last(Sutils.getDates(data))
    };
  };

  // get valid relations
  Sutils.getValidLinks = function(data, conf){
    var links = _(data)
      .filter('recordTypeId', 1)
      .filter(function(d){
        return _.includes(Sutils.getAllRecId(data), d.target)
            && _.includes(Sutils.getAllRecId(data), d.source);
      })
      .sortByAll(['startDate','typeId'])
      // .shuffle()
      .forEach(function(d){
        d.source = _(data).filter('recordId', d.source).value()[0];
        d.target = _(data).filter('recordId', d.target).value()[0];
        d.typeName = (''+d.typeName).toLowerCase();
      })
      .value();

    _.forEach(conf.relationTypePairing, function(p){

      var toTypeId = parseInt(Object.keys(p[0])[0]);

      _(links)
        .filter('typeId',  parseInt(Object.keys(p[1])[0]))
        .forEach(function(l){
          // rewrite link props
          l.typeId = toTypeId;
          l.typeName = p[0][toTypeId];

          var source = l.source;
          var target = l.target;

          l.target = source;
          l.source = target;

        }).value();
    })


    // merge links with same year, target or source, type

    var rank = 0;

    graph.linksToMergeS = Sutils.nest(links,['startDate', function(d){ return d.typeId+'_'+d[graph.corpus.mergeDirection].recordId}]);

    // apply a common rank for event who should be merged
    _.forEach(graph.linksToMergeS,function(year){
      _.forEach(year,function(group){
        group.forEach(function(d){ d.rank = rank; });
        rank++;
      });
    })

    return links;
  };

  // get linked nodes
  Sutils.getLinkedNodes = function(data, rel){
    var linkedNodes = [];
    _.forEach(rel, function(d){linkedNodes.push(d.source, d.target);});
    return _.uniq(linkedNodes);
  }

  // return type from a query
  Sutils.getTypes = function(data,q){
    return _(data)
      .sortBy('typeName')
      .where(q)
      .map(function(d){return d.typeId})
      .uniq()
      .value();
  };


  Sutils.getTimedLinks = function (element, q){
   return _(Sutils.getValidLinks(data))
    .where(q)
    .filter(function(d){ return d.source.recordId === element.recordId })
    .groupBy('startDate')
    .value()
    ;
  }

  function getShortName(d){
    if(d.shortName !== ''  && !_.isUndefined(d.shortName)) return d.shortName
    return d.title
  }


  if(typeof window === 'undefined' ) module.exports = Sutils; // node
  else window.Sutils = Sutils; // browser

})();
