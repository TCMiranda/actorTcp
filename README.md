# Actor TCP

_Actor-tcp_ is lightweight, independent, async, event based, tcp interface library

## Why

This package is meant to be single instance, lightweight, async and scope-full, in order to provide communication between objects in different scopes.
Binding on an event, maintains the worker scope, so they can continue to process the call in a non blocking way, with the next() method.

## How to Use It

The Actor boudle is single instance, so it listens and emits the same events all across your app.
Just require the "actor-emitter" library, then load "actor-tcp", to add the listeners

   var config = require('./config'),
   	   Mng = require('mongodb').MongoClient,
       emitter = require('actor-emitter');

    require('actor-tcp');

    var worker = function(err, db) {

        console.log('Worker connected to mongo: ' + config.paths.mongo);

        var Answers = db.collection('answers');

        emitter.trigger('tcp:connect', '127.0.0.1:34440');

        emitter.bind('tcp:open', function () {
            console.log('Client connected \nStarting streaming');
        });

        emitter.bind('c3a:store', function (msg) {

            Answers.insert(msg, function(err, data) {});
        });
    };

    Mng.connect(config.paths.mongo, worker);

The emitter is bound to:

    emitter.trigger('tcp:connect', {});
    emitter.trigger('tcp:send', {});

Incomming messages will emmit:

    emitter.bind('tcp:data', handler);

Thats it.

MIT license.
If you hit bugs, fill issues on github.
Feel free to fork, modify and have fun with it :)
