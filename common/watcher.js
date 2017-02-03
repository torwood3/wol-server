var Datastore = require('nedb')
	, db = new Datastore({ filename: 'data/production', autoload: true });
var polo = require('polo');
var os = require('os');

var apps = polo();

var toggleDeviceStatus = function(name, status) {
	db.update({
		name: {
			$eq: name
		}
	}, {
		$set: { updatedAt: new Date(), status: status }
	}, {}, function(err){});
}

var onDeviceUp = function(name) {
	if(apps.get(name) !== null) {
		toggleDeviceStatus(name, true);
	} else {
		if(name.indexOf("wol-") != -1) {
			var service = apps.get(name);
			db.insert({
				name: service.name,
				ip: service.ip,
				mac: service.mac,
				status: true
			});
		}
	}
}

var onDeviceDown = function(name) {
	if(apps.get(name) !== null) {
		toggleDeviceStatus(name, false);
	}
}


module.exports = function (app) {
	if(/^win/.test(os.platform())) return;

	console.log("Watchers");
	//On lance les watcher sur polo
	apps.on('up', function(name, service) {
		onDeviceUp(name);
	});

	apps.on('down', function (name, service) {
		onDeviceDown(name);
	});
};
