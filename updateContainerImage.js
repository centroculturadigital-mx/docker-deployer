var Docker = require('dockerode');
var DockerodeCompose = require('dockerode-compose');
var fs     = require('fs');
const yaml = require('js-yaml');
var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}

var docker = new Docker({ socketPath: socket });

var compose = new DockerodeCompose(docker, './docker-compose.wordpress.yml', 'wordpress');

(async () => {
  try {

    const doc = yaml.load(fs.readFileSync('./docker-compose.wordpress.yml', 'utf8'));
        let image = doc.services.db.image.split(':')
    doc.services.db.image = image[0]+':'+'4'
    let yamlStr = yaml.dump(doc);
    fs.writeFileSync('docker-compose.wordpress.yaml', yamlStr, 'utf8');

    // let x = await compose.pull(null);
    console.log('compose', JSON.stringify(compose));
    
    // console.log(state);
  } catch (error) {
    console.log('error', error);
    
  }
})();