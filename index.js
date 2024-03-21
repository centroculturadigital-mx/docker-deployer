const express = require("express");

var Docker = require('dockerode');
var fs     = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}


const app = express();
const hostname = "127.0.0.1";
const port = 3000;

var docker = new Docker({ socketPath: socket });

app.get("/", (req, res) => {


  docker.listContainers({all: true}, function(err, containers) {
    res.send("Hello World: containers " + containers.length);
  });


});

app.post("/update-image/:container", (req, res) => {

  var container = new DockerodeCompose(docker, './docker-compose.wordpress.yml', 'wordpress');
  const doc = yaml.load(fs.readFileSync('./docker-compose.wordpress.yml', 'utf8'));
        let image = doc.services.db.image.split(':')
    doc.services.db.image = image[0]+':'+'4'
    let yamlStr = yaml.dump(doc);
    fs.writeFileSync('docker-compose.wordpress.yml', yamlStr, 'utf8');

    // let x = await compose.pull(null);
    console.log('compose', JSON.stringify(compose));

});

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});