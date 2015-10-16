Handlebars.template({compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,a,l){var s,n,c=this.lambda,p=this.escapeExpression;return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body id="'+p(c(null!=(s=null!=e?e.corpus:e)?s.template:s,e))+'" class="container-fluid">\n    <hr/>\n      <p class="col-sm-8"><strong>'+p(c(null!=(s=null!=e?e.corpus:e)?s.title:s,e))+'</strong></p>\n      <p class="col-sm-2">'+p(c(null!=(s=null!=e?e.corpus:e)?s.date:s,e))+'</p>\n      <p class="col-sm-2" ><input id="zoom" type="range" value="6" max="20" min="1" step="1"></p>\n    <hr/>\n    <script type="text/javascript" src="assets/js/lib.min.js"></script>\n    <script type="text/javascript" src="assets/js/sutils.js"></script>\n    <script type="text/javascript">var config = \''+(null!=(n=null!=(n=t.config||(null!=e?e.config:e))?n:t.helperMissing,s="function"==typeof n?n.call(e,{name:"config",hash:{},data:l}):n)?s:"")+'\';</script>\n    <script type="text/javascript" src="assets/js/'+p(c(null!=(s=null!=e?e.corpus:e)?s.template:s,e))+'.js"></script>\n  </body>\n</html>\n'},useData:!0}),Handlebars.template({1:function(e,t,a,l){var s,n=t.helperMissing,c="function",p=this.escapeExpression;return'      <div class="row">\n        <h4 class="col-sm-5"><a href="'+p((s=null!=(s=t.template||(null!=e?e.template:e))?s:n,typeof s===c?s.call(e,{name:"template",hash:{},data:l}):s))+"_"+p((s=null!=(s=t.key||l&&l.key)?s:n,typeof s===c?s.call(e,{name:"key",hash:{},data:l}):s))+'.html">'+p((s=null!=(s=t.title||(null!=e?e.title:e))?s:n,typeof s===c?s.call(e,{name:"title",hash:{},data:l}):s))+'</a> </h4>\n        <p class="col-sm-1">'+p((s=null!=(s=t.template||(null!=e?e.template:e))?s:n,typeof s===c?s.call(e,{name:"template",hash:{},data:l}):s))+' </p>\n        <p class="col-sm-1"><a href="data/'+p((s=null!=(s=t.template||(null!=e?e.template:e))?s:n,typeof s===c?s.call(e,{name:"template",hash:{},data:l}):s))+"_"+p((s=null!=(s=t.key||l&&l.key)?s:n,typeof s===c?s.call(e,{name:"key",hash:{},data:l}):s))+'.json"  target="_blank">json</a> </p>\n        <pre class="col-sm-5"><a href="http://heurist.sydney.edu.au/h4-ao/?db=meder_test_to_delete&q='+p((s=null!=(s=t.query||(null!=e?e.query:e))?s:n,typeof s===c?s.call(e,{name:"query",hash:{},data:l}):s))+'" target="_blank">'+p((s=null!=(s=t.query||(null!=e?e.query:e))?s:n,typeof s===c?s.call(e,{name:"query",hash:{},data:l}):s))+"</a></pre>\n      </div>\n      <hr>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(e,t,a,l){var s,n;return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body class="container">\n    <h2>source corpus</h2>\n    <p>'+this.escapeExpression((n=null!=(n=t.date||(null!=e?e.date:e))?n:t.helperMissing,"function"==typeof n?n.call(e,{name:"date",hash:{},data:l}):n))+"</p>\n     <hr>\n"+(null!=(s=t.each.call(e,null!=e?e.corpus:e,{name:"each",hash:{},fn:this.program(1,l,0),inverse:this.noop,data:l}))?s:"")+"  </body>\n</html>\n"},useData:!0});