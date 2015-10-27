var Q = require('q')
  , cql = require('cassandra-driver')
  , logger = require('./Logger').getLogger('cql3.log')
  ;

var _self;
function CQL3Manager() {
	var dbmgr;
	_self = this;
}

CQL3Manager.prototype.getManager = function(cluster, keyspace, poolsize) {
	var deferred = Q.defer();

	try {
		this.dbmgr = new cql.Client({
			contactPoints: cluster,
			keyspace: keyspace,
			poolSize: poolsize
		});
		logger.info('CQL3 connection to Keyspace ' + keyspace + ' built.');
		deferred.resolve(this);
	}
	catch(ex) {
		logger.error(ex.stack);
		deferred.reject(ex);
	}

	return deferred.promise;
};

// Redirect log functions.
CQL3Manager.prototype.logInfo = logger.info;
CQL3Manager.prototype.logWarn = logger.warn;
CQL3Manager.prototype.logError = logger.error;

CQL3Manager.prototype.shutdown = function() {
	if (typeof(this.dbmgr) == 'undefined') 
		return logger.error('CQL3 connection is undefined.');
	this.dbmgr.shutdown();
};
// Redirect node-cassandra-cql funciton.
CQL3Manager.prototype.execute = function(query, parameters, callback) {
	if (typeof(this.dbmgr) == 'undefined') 
		return logger.error('CQL3 connection is undefined.');
	this.dbmgr.execute(query, parameters, callback);
};

// Build a promise cql function.
CQL3Manager.prototype.executePromise = function(query, parameters) {
	var deferred = Q.defer();
	this.dbmgr.execute(query, parameters, function(err, result) {
		if (err) {
			logger.warn(err);
			deferred.reject(err);
		}
		else {
			deferred.resolve(result);
		}
	});
	return deferred.promise;
}

module.exports = new CQL3Manager();
