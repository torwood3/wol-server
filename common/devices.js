/**
 * Created by pamas on 03/02/2017.
 */


var ping = require ("ping");
var wol = require('wake_on_lan');
var request = require('superagent');

var devices = function (req, res, next) {
	db.Device.findAll().then(function (devices) {
		console.log(devices);
		res.status(200).json({devices: devices});
	})
		.catch(function (error) {
			res.status(500).json(error);
		});
}

var deviceOn =  function(req, res) {
	db.Device.findById(req.params.id).then(function (device) {
		wol.wake(device.mac, function (error) {
			if (error) {
				res.status(200).json({error: "Magic paquet error"});
			} else {
				res.end();
			}
		});
	})
		.catch(function (error) {
			res.status(500).json(error);
		});
}

var deviceOff =  function(req, res) {
	db.Device.findById(req.params.id).then(function (device) {
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
		.catch(function (error) {
			res.status(500).json(error);
		});
}

var devicePing =  function(req, res) {
	db.Device.findById(req.params.id).then(function (device) {
		ping.promise.probe(device.ip).then(function (result) {
			console.log(result);
			res.status(200).json({isAlive: result.alive.toString()});
		});
	})
		.catch(function (error) {
			res.status(500).json(error);
		});;
}

module.exports = {
	devices: devices,
	deviceOn: deviceOn,
	deviceOff: deviceOff,
	devicePing: devicePing
};
