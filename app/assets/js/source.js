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
          return _.includes(self.getAllRecId(), d.target.id)
              && _.includes(self.getAllRecId(), d.source.id);
        })
        .forEach(function(d){
          d.source.rec = _(data).filter('recordId', d.source.id).value()[0];
          d.target.rec = _(data).filter('recordId', d.target.id).value()[0];
        })
        .value();
    };

    // return type from a query
    this.getTypes = function(q){
      return _(data)
        .sortBy('typeName')
        .where(q)
        .map(function(d){return d.typeId+' : '+d.typeName})
        .uniq()
        .value();
    };

    this.getTimedLinks = function (element, q){
     return _(self.getValidRel())
      .where(q)
      .filter(function(d){ return d.source.id === element.recordId })
      .groupBy('startDate')
      .value()
      ;
    }

    // data first global filter
    this.data = _(data).forEach(function(d){

      d.shortName = getShortName(d);

      console.log(d.shortName, d.shortTitle, d.name, ':', getShortName(d))
      // if( d.shortName === '') console.log(d);
      // if(_.isUndefined(d.startDate)) d.startDate = self.getTimeBounds(data).start - 1;
      // if( _.isUndefined(d.shortName))console.log(d);

      d.shortSummary = "…";
    }).value();

    function getShortName(d){
      if(d.shortName  !== '') return d.shortName +"s"
      if(d.shortTitle !== '') return d.shortTitle
      if(d.name !== '') return d.name
      if(d.title !== '') return d.title
    }

  }

  if(typeof window === 'undefined' ) module.exports = Source; // node
  else window.Source = Source; // browser

})();
