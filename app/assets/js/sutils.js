(function() {

  if(typeof window === 'undefined' ) _ = require('lodash');

  Sutils = {}

  // get all recordId
  Sutils.getAllRecId = function(data){
       return _(data).map('recordId').value();
  };

  Sutils.getAllSources = function(data){
    return _(data).filter('recordTypeId', 1)
      .map(function(d){
        return d.source.recordId;
      })
      .uniq()
      .filter(function(d){return ! _.isUndefined(d)})
      .value();
  }
  Sutils.getAllTargets = function(data){
    return _(data).filter('recordTypeId', 1)
      .map(function(d){
        return d.source.recordId;
      })
      .uniq()
      .filter(function(d){return ! _.isUndefined(d)})
      .value();
  }

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
  Sutils.getValidRel = function(data){
    return _(data)
      .filter('recordTypeId', 1)
      .filter(function(d){
        return _.includes(Sutils.getAllRecId(data), d.target)
            && _.includes(Sutils.getAllRecId(data), d.source);
      })
      .sortBy('startDate')
      .forEach(function(d){
        d.source = _(data).filter('recordId', d.source).value()[0];
        d.target = _(data).filter('recordId', d.target).value()[0];
      })
      .value();
  };

  // get used nodes
  Sutils.getValidNodes = function(data){
    var nodes = [];
    _(Sutils.getValidRel(data)).forEach(function(d){
      nodes.push(d.source.recordId, d.target.recordId);
      console.log(d);
    })
    .value();
    return nodes;
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
   return _(Sutils.getValidRel(data))
    .where(q)
    .filter(function(d){ return d.source.recordId === element.recordId })
    .groupBy('startDate')
    .value()
    ;
  }

  // data first global filter
  // sutils.data = _(data).reject('recordTypeId', 1).forEach(function(d){
  //   d.shortName = getShortName(d);
  // }).value();

  function getShortName(d){
    if(d.shortName !== ''  && !_.isUndefined(d.shortName)) return d.shortName
    return d.title
  }


  if(typeof window === 'undefined' ) module.exports = Sutils; // node
  else window.Sutils = Sutils; // browser

})();
