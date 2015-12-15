Handlebars.template({compiler:[6,">= 2.0.0-beta.1"],main:function(s,t,e,a){var l,n,p=this.lambda,r=this.escapeExpression,c=t.helperMissing,i="function";return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body id="'+r(p(null!=(l=null!=s?s.corpus:s)?l.template:l,s))+'" class="container-fluid">\n    <hr/>\n      <p class="col-sm-5 title"><strong><a href="./">'+r(p(null!=(l=null!=s?s.corpus:s)?l.title:l,s))+'</a></strong><br></p>\n      <p class="col-sm-3 description"><em>'+r(p(null!=(l=null!=s?s.corpus:s)?l.description:l,s))+'</em></p>\n      <p class="col-sm-2 update">'+r((n=null!=(n=t.update||(null!=s?s.update:s))?n:c,typeof n===i?n.call(s,{name:"update",hash:{},data:a}):n))+'</p>\n      <p class="col-sm-2 slide" ><input id="zoom" type="range" value="1" max="50" min="1" step="1"></p>\n    <hr/>\n    <script type="text/javascript" src="assets/js/lib.min.js"></script>\n    <script type="text/javascript" src="assets/js/sutils.js"></script>\n    <script type="text/javascript">var corpusId = \''+r((n=null!=(n=t.id||(null!=s?s.id:s))?n:c,typeof n===i?n.call(s,{name:"id",hash:{},data:a}):n))+'\';</script>\n    <script type="text/javascript" src="assets/js/'+r(p(null!=(l=null!=s?s.corpus:s)?l.template:l,s))+'.js"></script>\n  </body>\n</html>\n'},useData:!0}),Handlebars.template({1:function(s,t,e,a){var l,n=t.helperMissing,p="function",r=this.escapeExpression;return'      <div class="row">\n        <div class="col-sm-8">\n          <h4><a href="'+r((l=null!=(l=t.template||(null!=s?s.template:s))?l:n,typeof l===p?l.call(s,{name:"template",hash:{},data:a}):l))+"_"+r((l=null!=(l=t.key||a&&a.key)?l:n,typeof l===p?l.call(s,{name:"key",hash:{},data:a}):l))+'.html">'+r((l=null!=(l=t.title||(null!=s?s.title:s))?l:n,typeof l===p?l.call(s,{name:"title",hash:{},data:a}):l))+'</a> </h4>\n        </div>\n        <div class="col-sm-1">\n          '+r((l=null!=(l=t.template||(null!=s?s.template:s))?l:n,typeof l===p?l.call(s,{name:"template",hash:{},data:a}):l))+'<br> <a href="data/'+r((l=null!=(l=t.template||(null!=s?s.template:s))?l:n,typeof l===p?l.call(s,{name:"template",hash:{},data:a}):l))+"_"+r((l=null!=(l=t.key||a&&a.key)?l:n,typeof l===p?l.call(s,{name:"key",hash:{},data:a}):l))+'.json"  target="_blank">raw DATA</a>\n        </div>\n        <div class="col-sm-3">\n          <pre><a href="http://heurist.sydney.edu.au/h4-ao/?db=meder_test_to_delete&q='+r((l=null!=(l=t.query||(null!=s?s.query:s))?l:n,typeof l===p?l.call(s,{name:"query",hash:{},data:a}):l))+'" target="_blank">'+r((l=null!=(l=t.query||(null!=s?s.query:s))?l:n,typeof l===p?l.call(s,{name:"query",hash:{},data:a}):l))+"</a></pre>\n        </div>\n      </div>\n      <hr>\n"},compiler:[6,">= 2.0.0-beta.1"],main:function(s,t,e,a){var l,n;return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body class="container">\n     <hr>\n    <div class="row">\n      <strong class="col-sm-6">SOURCE database</strong>\n      <p class="col-sm-6">'+this.escapeExpression((n=null!=(n=t.date||(null!=s?s.date:s))?n:t.helperMissing,"function"==typeof n?n.call(s,{name:"date",hash:{},data:a}):n))+"</p>\n    </div>\n    <hr>\n"+(null!=(l=t.each.call(s,null!=s?s.corpus:s,{name:"each",hash:{},fn:this.program(1,a,0),inverse:this.noop,data:a}))?l:"")+"  </body>\n</html>\n"},useData:!0}),Handlebars.template({compiler:[6,">= 2.0.0-beta.1"],main:function(s,t,e,a){var l,n,p=this.lambda,r=this.escapeExpression,c=t.helperMissing,i="function";return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body id="'+r(p(null!=(l=null!=s?s.corpus:s)?l.template:l,s))+'" class="container-fluid">\n    <hr/>\n      <p class="col-sm-3"><strong><a href="./">'+r(p(null!=(l=null!=s?s.corpus:s)?l.title:l,s))+'</a></strong><br></p>\n      <p class="col-sm-5"><em>'+r(p(null!=(l=null!=s?s.corpus:s)?l.description:l,s))+'</em></p>\n      <p class="col-sm-2">'+r((n=null!=(n=t.update||(null!=s?s.update:s))?n:c,typeof n===i?n.call(s,{name:"update",hash:{},data:a}):n))+'</p>\n      <p class="col-sm-2" ><input id="zoom" type="range" value="5" max="20" min="1" step="1"></p>\n    <hr/>\n    <script type="text/javascript" src="assets/js/lib.min.js"></script>\n    <script type="text/javascript" src="assets/js/sutils.js"></script>\n    <script type="text/javascript">var corpusId = \''+r((n=null!=(n=t.id||(null!=s?s.id:s))?n:c,typeof n===i?n.call(s,{name:"id",hash:{},data:a}):n))+'\';</script>\n    <script type="text/javascript" src="assets/js/'+r(p(null!=(l=null!=s?s.corpus:s)?l.template:l,s))+'.js"></script>\n  </body>\n</html>\n'},useData:!0}),Handlebars.template({compiler:[6,">= 2.0.0-beta.1"],main:function(s,t,e,a){var l,n,p=this.lambda,r=this.escapeExpression,c=t.helperMissing,i="function";return'<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" type="text/css" href="assets/css/screen.css">\n    <meta charset="utf-8">\n  </head>\n  <body id="'+r(p(null!=(l=null!=s?s.corpus:s)?l.template:l,s))+'" class="container-fluid">\n    <hr/>\n      <p class="col-sm-3"><strong><a href="./">'+r(p(null!=(l=null!=s?s.corpus:s)?l.title:l,s))+'</a></strong><br></p>\n      <p class="col-sm-5"><em>'+r(p(null!=(l=null!=s?s.corpus:s)?l.description:l,s))+'</em></p>\n      <p class="col-sm-2">'+r((n=null!=(n=t.update||(null!=s?s.update:s))?n:c,typeof n===i?n.call(s,{name:"update",hash:{},data:a}):n))+'</p>\n      <p class="col-sm-2" ><input id="zoom" type="range" value="5" max="20" min="1" step="1"></p>\n    <hr/>\n    <script type="text/javascript" src="assets/js/lib.min.js"></script>\n    <script type="text/javascript" src="assets/js/sutils.js"></script>\n    <script type="text/javascript">var corpusId = \''+r((n=null!=(n=t.id||(null!=s?s.id:s))?n:c,typeof n===i?n.call(s,{name:"id",hash:{},data:a}):n))+'\';</script>\n    <script type="text/javascript" src="assets/js/'+r(p(null!=(l=null!=s?s.corpus:s)?l.template:l,s))+'.js"></script>\n  </body>\n</html>\n'},useData:!0});