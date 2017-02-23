/**
 * Created by pamas on 03/02/2017.
 */


var ping = require ("ping");
var wol = require('wake_on_lan');
var request = require('superagent');
var Datastore = require('nedb')
	, db = new Datastore({ filename: 'data/production', autoload: true });

var devices = function (req, res, next) {
	console.log("Get All devices");
	db.find({}, function (err, devices) {
		if(err) 			res.status(500);

		console.log(devices);
		res.json({devices: devices});
	})
}

var deviceOn =  function(req, res) {
	console.log(req.params);
	console.log("Get on device : " + req.params.id);
	db.find({_id: req.params.id}, function (err, device) {
		if(err) 			res.status(500);

		wol.wake(device.mac, function (error) {
			if (error) {
				res.json({error: "Magic paquet error"});
			} else {
				res.end();
			}
		});
	})
}

var deviceOff =  function(req, res) {
	console.log(req.params);
	console.log("Get off device : " + req.params.id);
	db.find({_id: req.params.id},function (err, device) {
		if(err) 			res.status(500);

		var port = device.port || 3000;
		request
			.get('http://' + device.ip +':'+ port +'/api/poweroff')
			.end(function(err, _res) {
				if (err) {
					res.end();
					return;
				}
				res.end();

				setTimeout(function(){
					pingDevice(device).then(function (result) {
						if (result.alive) {
							var port = device.port || 3000;
							request.get('http://' + device.ip +':'+ port +'/api/poweroff')
						}
					});
				}, 60 * 1000);

			});
	})
}

var devicePing =  function(req, res) {
	db.find({_id: req.params.id}, function (err, device) {
		if(err) 			res.status(500);

		ping.promise.probe(device.ip).then(function (result) {
			db.update({ _id: req.params.id }, { $set: { status: result.alive.toString()} }, function (err, numReplaced) {
				if(err) 			res.status(500);
				res.json({isAlive: result.alive.toString()});
			});
		});
	})
}

var deleteDevice = function(req, res) {
	db.remove({_id: req.params.id}, function (err, numRemoved) {
		if(err) 			res.status(500);
		res.json({numDeleted: numRemoved});
	})
}

var addDevice = function(req, res) {
	db.insert({
		name: req.body.name,
		ip: req.body.ip,
		mac: req.body.mac,
		status: false
	}, function(err, device) {
		if(err) 			res.status(500);
		res.json({newDevice: device});
	});
}

module.exports = {
	devices: devices,
	deviceOn: deviceOn,
	deviceOff: deviceOff,
	devicePing: devicePing,
	addDevice: addDevice,
	deleteDevice: deleteDevice
};


setInterval(function() {
	db.find({}, function (err, devices) {
		if(err) 			res.status(500);
		console.log("Devices (" + devices.length +")");
		devices.forEach(function(device) {
			console.log(device);
			ping.promise.probe(device.ip).then(function (result) {
				console.log(device.ip + " - " + result.alive);
				db.update({ _id: device._id }, { $set: { status: result.alive.toString()} }, function (err, numReplaced) {
					if(err) 		console.log(device._id + " - ping error");
					console.log(device._id + " - ping ok");

				});
			});
		});
	})
}, 1000 * 5);