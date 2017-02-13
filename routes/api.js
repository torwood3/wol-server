/**
 * Created by pamas on 03/02/2017.
 */

var deviceCtrl = require('../common/devices.js');

module.exports = function (server) {
	server.get('/api/devices/', deviceCtrl.devices);
	server.post('/api/devices/', deviceCtrl.addDevice);
	server.get('/api/devices/:id/delete', deviceCtrl.deleteDevice);
	server.get('/api/devices/:id/wol', deviceCtrl.deviceOn);
	server.get('/api/devices/:id/poweroff', deviceCtrl.deviceOff);
	server.get('/api/devices/:id/ping', deviceCtrl.devicePing);
};
