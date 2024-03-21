var Docker = require('dockerode');
var fs     = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}

var docker = new Docker({ socketPath: socket });

docker.listContainers({all: true}, function(err, containers) {
  console.log('ALL: ' + containers[0]);
});

docker.listContainers({all: false}, function(err, containers) {
  console.log('!ALL: ' + JSON.stringify (containers[0]));
});

// filter by labels
var opts = {
  "limit": 3,
  "filters": '{"label": ["staging","env=green"]}'
};

// maps are also supported (** requires docker-modem 0.3+ **)
opts["filters"] = {
  "label": [
    "staging",
    "env=green"
  ]
};

docker.listContainers(opts, function(err, containers) {
  console.log('Containers labeled staging + env=green : ' + containers.length);
});
