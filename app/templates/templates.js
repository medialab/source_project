Handlebars.template({compiler:[6,">= 2.0.0-beta.1"],main:function(s,e,t,a){var n,l,r=this.lambda,c=this.escapeExpression;return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body id="'+c(r(null!=(n=null!=s?s.corpus:s)?n.template:n,s))+'" class="container-fluid">\n\n\n    <div class="row header">\n      <h4  class="col-sm-1">30 years of&nbsp;Schengen</h4>\n      <h1 class="col-sm-5 title"><a href="./">'+(null!=(n=r(null!=(n=null!=s?s.corpus:s)?n.title:n,s))?n:"")+'</a></h1>\n      <h6 class="col-sm-4 comment">'+c(r(null!=(n=null!=s?s.corpus:s)?n.description:n,s))+'</h6>\n\n      <p class="col-sm-2 disclaimer">\n        <strong>Disclaimer</strong><em>\n        ‘This is a work in progress not a final version. Do not quote or circulate.\n        If you have any questions or remarks please contact mederic.martin-maze@kcl.ac.uk <br>\n        <br>\n        <strong>how to read ?</strong>\n        Horizontal lines represents entities ( documents, organisations, devices ) and vertical lines represents relations.\n        Relations between entities change over time : they allow us to capture transformations and dynamics.</em>\n      </p>\n\n    </div>\n    <div class="graph row"></div>\n\n    <p class="col-sm-1 slide" ><input id="zoom" type="range" value="1" max="50" min="1" step="1"></p>\n\n    <script type="text/javascript" src="assets/js/lib.min.js"></script>\n    <script type="text/javascript" src="assets/js/sutils.js"></script>\n    <script type="text/javascript">var corpusId = \''+c((l=null!=(l=e.id||(null!=s?s.id:s))?l:e.helperMissing,"function"==typeof l?l.call(s,{name:"id",hash:{},data:a}):l))+'\';</script>\n    <script type="text/javascript" src="assets/js/'+c(r(null!=(n=null!=s?s.corpus:s)?n.template:n,s))+'.js"></script>\n  </body>\n</html>\n'},useData:!0}),Handlebars.template({1:function(s,e,t,a){var n,l=e.helperMissing,r="function",c=this.escapeExpression;return'      <div class="row">\n        <div class="col-sm-8">\n          <h4><a href="'+c((n=null!=(n=e.template||(null!=s?s.template:s))?n:l,typeof n===r?n.call(s,{name:"template",hash:{},data:a}):n))+"_"+c((n=null!=(n=e.key||a&&a.key)?n:l,typeof n===r?n.call(s,{name:"key",hash:{},data:a}):n))+'.html">'+c((n=null!=(n=e.title||(null!=s?s.title:s))?n:l,typeof n===r?n.call(s,{name:"title",hash:{},data:a}):n))+'</a> </h4>\n        </div>\n        <div class="col-sm-1">\n          '+c((n=null!=(n=e.template||(null!=s?s.template:s))?n:l,typeof n===r?n.call(s,{name:"template",hash:{},data:a}):n))+'<br> <a href="data/'+c((n=null!=(n=e.template||(null!=s?s.template:s))?n:l,typeof n===r?n.call(s,{name:"template",hash:{},data:a}):n))+"_"+c((n=null!=(n=e.key||a&&a.key)?n:l,typeof n===r?n.call(s,{name:"key",hash:{},data:a}):n))+'.json"  target="_blank">raw DATA</a>\n        </div>\n        <div class="col-sm-3">\n          <pre><a href="http://heurist.sydney.edu.au/h4-ao/?db=meder_test_to_delete&q='+c((n=null!=(n=e.query||(null!=s?s.query:s))?n:l,typeof n===r?n.call(s,{name:"query",hash:{},data:a}):n))+'" target="_blank">'+c((n=null!=(n=e.query||(null!=s?s.query:s))?n:l,typeof n===r?n.call(s,{name:"query",hash:{},data:a}):n))+"</a></pre>\n        </div>\n      </div>\n      <hr>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(s,e,t,a){var n,l;return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body class="container">\n     <hr>\n    <div class="row">\n      <strong class="col-sm-6">SOURCE database</strong>\n      <p class="col-sm-6">'+this.escapeExpression((l=null!=(l=e.date||(null!=s?s.date:s))?l:e.helperMissing,"function"==typeof l?l.call(s,{name:"date",hash:{},data:a}):l))+"</p>\n    </div>\n    <hr>\n"+(null!=(n=e.each.call(s,null!=s?s.corpus:s,{name:"each",hash:{},fn:this.program(1,a,0),inverse:this.noop,data:a}))?n:"")+"  </body>\n</html>\n"},useData:!0}),Handlebars.template({compiler:[6,">= 2.0.0-beta.1"],main:function(s,e,t,a){var n,l,r=this.lambda,c=this.escapeExpression,i=e.helperMissing,p="function";return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body id="'+c(r(null!=(n=null!=s?s.corpus:s)?n.template:n,s))+'" class="container-fluid">\n    <hr/>\n      <p class="col-sm-3"><strong><a href="./">'+c(r(null!=(n=null!=s?s.corpus:s)?n.title:n,s))+'</a></strong><br></p>\n      <p class="col-sm-5"><em>'+c(r(null!=(n=null!=s?s.corpus:s)?n.description:n,s))+'</em></p>\n      <p class="col-sm-2">'+c((l=null!=(l=e.update||(null!=s?s.update:s))?l:i,typeof l===p?l.call(s,{name:"update",hash:{},data:a}):l))+'</p>\n      <p class="col-sm-2" ><input id="zoom" type="range" value="5" max="20" min="1" step="1"></p>\n    <hr/>\n    <script type="text/javascript" src="assets/js/lib.min.js"></script>\n    <script type="text/javascript" src="assets/js/sutils.js"></script>\n    <script type="text/javascript">var corpusId = \''+c((l=null!=(l=e.id||(null!=s?s.id:s))?l:i,typeof l===p?l.call(s,{name:"id",hash:{},data:a}):l))+'\';</script>\n    <script type="text/javascript" src="assets/js/'+c(r(null!=(n=null!=s?s.corpus:s)?n.template:n,s))+'.js"></script>\n  </body>\n</html>\n'},useData:!0}),Handlebars.template({compiler:[6,">= 2.0.0-beta.1"],main:function(s,e,t,a){var n,l,r=this.lambda,c=this.escapeExpression,i=e.helperMissing,p="function";return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body id="'+c(r(null!=(n=null!=s?s.corpus:s)?n.template:n,s))+'" class="container-fluid">\n    <hr/>\n      <p class="col-sm-3"><strong><a href="./">'+c(r(null!=(n=null!=s?s.corpus:s)?n.title:n,s))+'</a></strong><br></p>\n      <p class="col-sm-5"><em>'+c(r(null!=(n=null!=s?s.corpus:s)?n.description:n,s))+'</em></p>\n      <p class="col-sm-2">'+c((l=null!=(l=e.update||(null!=s?s.update:s))?l:i,typeof l===p?l.call(s,{name:"update",hash:{},data:a}):l))+'</p>\n      <p class="col-sm-2" ><input id="zoom" type="range" value="5" max="20" min="1" step="1"></p>\n    <hr/>\n    <script type="text/javascript" src="assets/js/lib.min.js"></script>\n    <script type="text/javascript" src="assets/js/sutils.js"></script>\n    <script type="text/javascript">var corpusId = \''+c((l=null!=(l=e.id||(null!=s?s.id:s))?l:i,typeof l===p?l.call(s,{name:"id",hash:{},data:a}):l))+'\';</script>\n    <script type="text/javascript" src="assets/js/'+c(r(null!=(n=null!=s?s.corpus:s)?n.template:n,s))+'.js"></script>\n  </body>\n</html>\n'},useData:!0});