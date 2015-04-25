'use strict';

var net = require('net'),
    emitter = require('actor-emitter');

var _client = null;

var tcpSend = function(msg) {

    _client.write(typeof msg == "string"
                  ? msg : JSON.stringify(msg));
};

var onStringData = function(data) {

    let parsed = data.split('|');

    try {

        parsed[1] = JSON.parse(parsed[1]);

    } catch (e) { /* Not json */ }

    emitter.trigger(parsed[0], parsed[1]);

};

var onJSONData = function(parsed) {

    let code = parsed.future || parsed.__code__ || parsed.code || '';

    emitter.trigger(parsed.future ||
                    parsed.header + ':' +
                    parsed.action + (code ? ':' + code : '' ));

};

var onEachData = function(data) {

    try {

        let parsed = JSON.parse(data);

        emitter.next(onJSONData, parsed);

    } catch (e) {

        emitter.next(onStringData, data);
    }

    emitter.trigger('tcp:data', data);
};

var tcpData = function(data) {

    data = data.toString();

    data.split('\\').forEach(function (item) {

        if (item) emitter.next(onEachData, item);
    });
};

var tcpDisconnect = function() {


};

var doConnect = function(options) {

    _client = net.connect(options, emitter.trigger.bind(this, 'tcp:open'));
    _client.on('data', tcpData);
    _client.on('end', tcpDisconnect);
};

var parseConnect = function (url) {

    let args = url.split(':');

    emitter.next(doConnect.bind(this, {
        host: args[0],
        port: args[1]
    }));
};

var tcpConnect = function (args) {

    emitter.next(
        typeof args == "string"
            ? parseConnect.bind(this, args)
            : doConnect.bind(this, args));
};

emitter.bind('tcp:connect', tcpConnect);
emitter.bind('tcp:send', tcpSend);

module.exports = emitter;
