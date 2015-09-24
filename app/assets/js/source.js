(function () {

  // dep
  if(typeof window === 'undefined' ) _ = require('lodash');

  var source = {};

  // rel = relation
  // rec = record

  // get all recordId
  source.getAllRecId = _.memoize(function(data){
     return _(data)
        .map('recordId')
        .value();
  });

  // get dates
  source.getDates = function(data){
   return _(data)
      .map('startDate')
      .uniq()
      .reject(_.isUndefined)
      .value()
      ;
  }

  //
  source.getTimeBounds = function(data){
    return {
      'start':_.first(source.getDates(data)),
      'end': _.last(source.getDates(data))
    };
  }

  // get valid relations
  source.getValidRel = _.memoize(function(data){
    return _(data)
      .filter('recordTypeId', 1)
      .filter(function(d){
        return _.includes(source.getAllRecId(data), d.target.id)
          && _.includes(source.getAllRecId(data), d.source.id);
      })
      .value()
      ;
  });

  source.getRelType = function(data){
    return _(source.getValidRel(data))
      .sortBy('typeName')
      .map(function(d){return d.typeId+'  : '+d.typeName})
      .uniq()
      .value()
      ;
  }

  if(typeof window === 'undefined' ) module.exports = source; // node
  else window.source = source; // browser

})();
