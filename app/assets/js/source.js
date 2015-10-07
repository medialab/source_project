(function () {

  if(typeof window === 'undefined' ) _ = require('lodash');

  function Source(data){

    var self = this;

    // get all recordId
    this.getAllRecId = function (){
         return _(data).map('recordId').value();
    };

    // get dates
    this.getDates = function (){
     return _(data)
        .map('startDate')
        .uniq()
        .sortBy()
        .reject(_.isUndefined)
        .value();
    };

    // get time limits
    this.getTimeBounds = function (){
      return {
        'start':_.first(self.getDates(data)),
        'end': _.last(self.getDates(data))
      };
    };

    // get valid relations
    this.getValidRel = function (){
      return _(data)
        .filter('recordTypeId', 1)
        .filter(function(d){
          return _.includes(self.getAllRecId(), d.target)
              && _.includes(self.getAllRecId(), d.source);
        })
        .sortBy('startDate')
        .forEach(function(d){
          d.source = _(data).filter('recordId', d.source).value()[0];
          d.target = _(data).filter('recordId', d.target).value()[0];
        })
        .value();
    };

    // return type from a query
    this.getTypes = function(q){
      return _(data)
        .sortBy('typeName')
        .where(q)
        .map(function(d){return d.typeId})
        .uniq()
        .value();
    };


    this.getTimedLinks = function (element, q){
     return _(self.getValidRel())
      .where(q)
      .filter(function(d){ return d.source.recordId === element.recordId })
      .groupBy('startDate')
      .value()
      ;
    }

    // data first global filter
    this.data = _(data).reject('recordTypeId', 1).forEach(function(d){
      d.shortName = getShortName(d);
    }).value();

    function getShortName(d){
      if(d.shortName !== ''  && !_.isUndefined(d.shortName)) return d.shortName
      return d.title
    }

  }

  if(typeof window === 'undefined' ) module.exports = Source; // node
  else window.Source = Source; // browser

})();
