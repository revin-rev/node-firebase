var express    = require('express');
var path       = require('path');
var bodyParser = require('body-parser');
var index      = require('./routes/index');
var _          = require('lodash');
var app        = express();

var valid_route = [
    '/',
    '/bulletin',
    '/social',
    '/users',
    '/user-details',
    '/user-courses',
    '/student-courses',
    '/cron',
    '/current-activity',
    '/ajax'
]

var parseurl = require('parseurl');
var session = require('express-session');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));

app.use(function (req, res, next) {
  // req.session.token_custom = 'abc';
  var views = req.session.views
//   console.log('req==-->>', req);
  if (!views) {
    views = req.session.views = {}
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // count the views
  views[pathname] = (views[pathname] || 0) + 1
  // console.log('index.js==-->>>', req.session);

//   res.on('finish', function() {
//     if( req.route && _.findIndex(valid_route, (o) => { return o == req.route.path; }) > -1 ) {
//         if( req.session.token_custom != 'abc' ) {
//             console.log('========------->>redirect', req.session.token_custom);
//             res.redirect('/login');
//         } else {
//             console.log('yoyo here everything fine', req.session.token_custom);
//         }
//     } else {
//         // console.log('R', req.route);
//     }
//   });

    next()
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'vash');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);

var server = app.listen(3001, function () {
    console.log('Node server is running on port 3001..');
    console.log('open url in browser : http://localhost:3001/');
});
