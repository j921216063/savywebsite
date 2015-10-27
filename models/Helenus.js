var helenus = require('helenus');
var util = require('util');
var events = require('events');

var _self;
function HelenusManager()
{
	_self = this;
	events.EventEmitter.call(this);
}

HelenusManager.prototype = events.EventEmitter.prototype;

/**
 * Please note that the getManager function both have a return value and the 
 * callback function. It is because while value returning, the actual database
 * connection is not ready.
 */
HelenusManager.prototype.getManager = function(keyspace, callback)
{
	var dbmgr = new helenus.ConnectionPool({
		hosts: GLOBAL.CASSANDRA_CLUSTER,
		keyspace: keyspace,
		hostPoolSize: GLOBAL.CASSANDRA_POOLSIZE
	});

	dbmgr.on('error', function(err) {
		GLOBAL.DBLOGGER.error(err.stack);
	});

	dbmgr.connect(function(err, keyspace) {
		_self.emit('db_connected');

		// Neil_20130728: To use Helenus Thrift API, pass the keyspace with dbmgr.
		dbmgr.keyspace = keyspace;

		if (callback)
			callback(null, dbmgr);
	});
	return dbmgr;
};

util.inherits(HelenusManager, events.EventEmitter);

module.exports = new HelenusManager();

