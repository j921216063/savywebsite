/**
 * Module dependencies.
 */
var express = require('express')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , multer = require('multer')					// for multipart http request
  , session = require('express-session')
  , favicon = require('serve-favicon')
  , loggerMiddleware = require('morgan')
  , http = require('http')
  , path = require('path')
  , Q = require('q')
  , useragent = require('express-useragent')
  , passport = require('passport')
  , logger = require('./models/Logger').getLogger('system.log')
  , template = require('./models/Template')
  ;

/**
 * Initialize system constants
 **/
function initConstant()
{
	// Here we check system settings to make sure the project setting is the latest one.
	template.checkSystemJson(logger);

	var system = require('./system.json');
	process.env.NODE_ENV = system.NODE_ENV;
	GLOBAL.HOMEURL = 			'http://' + system[system.NODE_ENV]['context.domain'];
	GLOBAL.SERVERHOST = 		system[system.NODE_ENV]['context.host'];
	GLOBAL.SERVERPORT = 		system[system.NODE_ENV]['context.port'];
	GLOBAL.BASEPATH   = 		system[system.NODE_ENV]['context.path'];
	GLOBAL.FOLDER_UPLOADS = 	path.join(__dirname + '/' + system[system.NODE_ENV]['folder.uploads']);
	GLOBAL.FOLDER_TMP = 		path.join(__dirname + '/' + system[system.NODE_ENV]['folder.tmp']);
	// GLOBAL.URL_UPLOADS = 		system[system.NODE_ENV]['url.uploads'];
	// GLOBAL.URL_TMP = 			system[system.NODE_ENV]['url.tmp'];
	GLOBAL.CASSANDRA_CLUSTER = 	system[system.NODE_ENV]['cassandra.hosts'] || ['localhost'];
	GLOBAL.CASSANDRA_POOLSIZE = system[system.NODE_ENV]['cassandra.poolSize'] || 16;
	GLOBAL.CASSANDRA_KEYSPACE = system[system.NODE_ENV]['cassandra.keyspace'];
}

/**
 * Initialize database manager
 **/
function initDbmgr()
{
	var deferred = Q.defer();
	
	/*

	require('./models/CQL3').getManager(
		GLOBAL.CASSANDRA_CLUSTER,
		GLOBAL.CASSANDRA_KEYSPACE,
		GLOBAL.CASSANDRA_POOLSIZE
	)
	.then(function(dbmgr) {
		GLOBAL.CQL3 = dbmgr;
	})
	.catch(function(ex) {
		deferred.reject(ex);
	})
	.done(function() {
		deferred.resolve();
	});
	*/

	deferred.resolve();
	return deferred.promise;
}

/**
 * Initialize application.
 **/
function initApp() 
{
	var app = express();

	// all environments
	app.set('port', GLOBAL.SERVERPORT || 3000);
	app.set('views', path.join(__dirname + '/views'));
	app.set('view engine', 'jade');
	app.use(favicon(path.join(__dirname + '/public/images/cloudeep.ico')));
	app.use(loggerMiddleware('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	// Neil_20150814: Multer changes usage after 1.*, note the name should match the name of input.
	// app.use(multer({dest: GLOBAL.FOLDER_TMP}).fields([{name: 'image', maxCount: 1}]));
	app.use(multer({dest: GLOBAL.FOLDER_TMP}).single('image'));
	app.use(cookieParser());
	app.use(session({
		secret: 'cloudeep',
		resave: false,
		saveUninitialized: true
	}));
	// User authentication using Passport module, and it should be placed after express.session().
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(require('stylus').middleware({
		src: path.join(__dirname + '/public'),
		compress: true
	}));
	app.use(express.static(path.join(__dirname, 'public'), { maxAge:3600 }));
	// init useragent
	app.use(useragent.express());

	// Every jade page has a locals variable, set various information to it.
	app.use(function (req, res, next) {
		res.locals.user = req.user;
		res.locals.useragent = useragent.parse(req.headers['user-agent']);
		next();
	});

	/**
	 * Route dependencies.
	 **/
	var routeIndex = require('./routes/index.js')
	  ;

	//
	// TODO: Write your route here.
	//
	app.get('/', routeIndex.index);
	
	// Restful sample
	app.use('/resource/restful', require('./routes/restful/RESTful'));


	// Route all exceptions (should be the last route) to error page.
	app.use(function(req, res) {
		res.status(404).render('404');
	});

	// The final error handling.
	process.on('uncaughtException', function(err) {
		logger.error(err.stack);
		process.exit(-1);
	});

	process.on('SIGINT', function(err) {
		logger.warn('Terminated by SIGINT.');
		process.exit();
	});

	// The http processes.
	http.createServer(app).listen(app.get('port'), function(){
		logger.info('Express server listening on port ' + app.get('port'));
	});
}

/**
 * Start
 **/
initConstant();
initDbmgr()
.then(initApp)
.done();
