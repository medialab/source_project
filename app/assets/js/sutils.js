(function() {

  if(typeof window === 'undefined' ) _ = require('lodash');

  Sutils = {};

  // nest
  // https://gist.github.com/joyrexus/9837596
  Sutils.nest = function (seq, keys) {
    if (!keys.length) return seq;
    var first = keys[0];
    var rest = keys.slice(1);
    return _.mapValues(_.groupBy(seq, first), function (value) {
        return Sutils.nest(value, rest)
    });
  };

  // multi value filter
  Sutils.multiValueFilter =  function(d, obj, way){
    var res = true;
    _.forEach(obj, function(n, key){
      n.forEach(function(val){ res = (res && d[key] !== val);})
    })
    return way ? res : !res
  }

  //
  Sutils.dataCheck = function(data){

    var r = {}; // report
    var fields = ['startDate','endDate','shortName','source','target'];

    _.forEach(fields, function(f){
      var und = _.filter(data, function(d){ return _.isUndefined(d[f]) });
      r['undefined-'+f]= Sutils.nest(und, ['recordTypeName','typeName']);
    })

    // types
    r.recordsByTypes = Sutils.nest(data, ['recordTypeName',function(d){ return d.typeId+': ' + d.typeName; }])

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

  // merge node from relations

  Sutils.mergeNodesFromRelation = function(data, conf, l){

    var d = data;
    _.forEach(l.nodesMergeFromRelation, function(t){
      _(d)
        .filter('recordTypeId', 1)
        .filter('typeId', t)
        .forEach(function(l){
          _(d)
            .filter('source', l.target)
            .forEach(function(n,i){
              n.source = l.source;
            }).value()

          _(d)
            .filter('target', l.target)
            .forEach(function(n,i){
              n.target = l.source;
            }).value()
        }).value()
    })
    return d
  }

  // get valid relations
  Sutils.getValidLinks = function(data, conf, l){
    var links = _(data)
      .filter('recordTypeId', 1)
      // .reject(function(d){ return d.typeId === 5364 && d.startDate > 9000 }) // reject infinite discontinues relations
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

    _.forEach(conf.relMerges, function(p){

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
    var linksToMergeS = Sutils.nest(links,['startDate', function(d){ return d.typeId+'_'+d[g.corpus.mergeDirection].recordId}]);

    // apply a common rank for event who should be merged
    _.forEach(linksToMergeS,function(year){
      _.forEach(year,function(group){
        rank++;

        var relRank = 0 ;
        group.forEach(function(d){
          relRank ++;
          d.rank = rank;
          d.relRank = relRank;
        });
        rank++;
      });
    })

    _(l.nodesMergeFromRelation).forEach(function(t){
      links = _(links).reject('typeId',t).value()
    }).value()

    return _.compact(links);
  };

  // get linked nodes
  Sutils.getLinkedNodes = function(data, rel){
    var linkedNodes = [];

    _.forEach(rel, function(d){
      linkedNodes.push(d.source, d.target);
    });
    return _.uniq(linkedNodes);
  }

  // get node lines
  Sutils.getNodeLines = function(nodes, links, layout){
    return _(nodes).map(function(n){

      var dates = _(links).filter(function(d){
       return d.target.recordId === n.recordId || d.source.recordId === n.recordId;
      })
      .sortBy('startDates')
      .value();

      var last = _.indexOf(layout.stopRelation , _.last(dates).typeId) > -1 ? _.last(dates).recordId : _(links).sortBy('startDates').last().recordId

      return _.merge(n,{
        endId:last,
        startId:_.first(dates).recordId
      })

    }).compact().value();
  }

  // index pathways
  Sutils.indexPathway = function(g, key){
     return _(g.nodes).
      map(function(n){
        var points = [];
        _(g.links)
        .filter(function(l){
          return l.target[key] === n[key] ||  l.source[key] === n[key]
        })
        .sortBy('startDate')
        .forEach(function(l){
          if(g.layout.pathwayCrossTarget)points.push([1, l.recordId, n.recordId])
          if(g.layout.pathwayCrossSource)points.push([0, l.recordId, n.recordId])
        }).value()

      return points
    })
    .filter(function(d){
      return d.length > g.layout.pathwayMinSteps
    })
    .value()
  }

  // return type from a query
  Sutils.getTypes = function(data,q,r){
    return _(data)
      .sortBy('typeName')
      .where(q)
      .reject(r| {'all':0} )
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

  // applies type dependant layout
  Sutils.getCustomLayout = function(g, type){
    var index = _(g[type]).indexBy('typeId').value();
    _(g.corpus[type].layouts).forEach(function(customLayout){
      customLayout.typeIds.forEach(function(id){
        index[id] = customLayout.layout;
      })
    }).value()

    return index
  }

  if(typeof window === 'undefined' ) module.exports = Sutils; // node
  else window.Sutils = Sutils; // browser

  Sutils.Palettes ={}

  Sutils.Palettes.typeId = {
    5092:"#558237",
    5097:"#CF7AD6",
    5111:"#DF5251",
    5112:"#5093BA",
    5156:"#BE8A2C",
    5158:"#38A684",
    5162:"#7D8BDF",
    5163:"#5BB942",
    5178:"#DB539A",
    5241:"#9DA531",
    5333:"#C96531",
    5336:"#886CA4",
    5344:"#C25068",
    5364:"#BF6E9A",
  };


  Sutils.colors = [
    [
    '#899EBA','#D4B259','#71463A','#558C64','#E6876A','#41575F',
    '#E7A5AC','#797937','#76BEA7','#B1C46F','#48898E','#C999C3',
    '#93646F','#5B593C','#936935','#2C5945','#63BAC4','#94B68B',
    '#D98481','#BC8499','#98949E','#D89479','#BC7D4B','#4D8773',
    '#48A398','#B19445','#716736','#778598','#ABABC5','#5B572D'
    ],
    ["#CF81CE","#73E13A","#EE5F35","#67E2D5","#A8A048","#7097DA",
     "#DA8173","#D95FE4","#6ADF9F","#D58943","#65A836","#C7E23F",
     "#EB58A3","#9183EB","#BEE27F","#79B5CF","#EE576C","#CD86A4",
     "#61DE6F","#70A967","#59AA94","#C4A6D5","#DFA836","#DACB43"],

    ["#915A72","#4F802D","#AE5A27","#222C1B","#407B88","#7B74B7",
     "#8D761C","#C84E57","#2A3349","#3C7E5F","#7B6552","#513015",
     "#803437","#3A4E1E","#34554E","#4278A8","#56263B","#B54E81",
     "#746D78","#545178","#6B7951","#916099","#80642F","#3B2E30",
     "#A46053"],
  ];
})();
