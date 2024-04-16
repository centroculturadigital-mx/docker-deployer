const express = require("express");
const fs = require("fs");
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const yaml = require('js-yaml')
const util = require('util')
const { format, formatDistanceToNow } = require('date-fns');

const Docker = require("dockerode");
const DockerodeCompose = require("dockerode-compose");
const socket = process.env.DOCKER_SOCKET || "/var/run/docker.sock";

const stats = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error("Are you sure the docker is running?");
}

const app = express();

app.engine('.hbs', engine({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static("public"));
app.use(express.json());

app.use(bodyParser.urlencoded({extended: false}));

const hostname = "127.0.0.1";
const port = 3000;

const docker = new Docker({ socketPath: socket });

app.get("/", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  let ls  = fs.readdirSync('./composes')
  console.log('ls', ls);
  

  docker.listContainers({ all: true }, function (err, containers) {
    res.render("main", { 
      layout: "index", 
      containers,
      hasContainers: true
    });
  });
});

app.get("/update-image/:container", async (req, res) => {

  
  let container = await docker.getContainer(req.params.container)
  
  let status, startDate, finishDate

  let data = await container.inspect()
  
  if (data) {

    
    status = data.State.Status
    startDate = data.State.StartedAt
    finishDate = data.State.FinishedAt
    // console.log("container", util.inspect(data, { depth: null, colors: true }));
    // const compose = new DockerodeCompose(
    //   docker,
    //   "./docker-compose.node.yml",
    //   "node-test"
    // );
    // const doc = yaml.load(
    //   fs.readFileSync("./docker-compose.node.yml", "utf8")
    // );
    // let image = doc.services['node-test'].image.split(":");
    // doc.services['node-test'].image = image[0] + ":" + "4";
    // let yamlStr = yaml.dump(doc);
    // fs.writeFileSync("docker-compose.node.yml", yamlStr, "utf8");
  
    // let x = await compose.pull(null);
    // console.log("compose", util.inspect(doc.Config, { depth: null, colors: true }));
    res.render("changeTag", { 
      layout: "index", 
      name: data.Name,
      status,
      startDate: formatDistanceToNow(new Date(startDate)),
      finishDate,
      registry: data.Config.Image.split(':')[0],
      currentTag: data.Config.Image.split(':')[1]
    });
  }

  // });

});

app.post('/api/changeTag/:name/:image',async (req, res) => {
  const { name, image} = req.params;
  
  const { nextTag } = req.body;


  console.log(`Received request to change tag for ID ${name} ${image} to ${nextTag}`);
  const newImageTag = image + ':' + nextTag
  console.log('newImageTag', newImageTag);
  

  try {

    let resPull = await docker.pull(newImageTag)
    console.log('resPull', resPull);
  } catch (err) {
    console.log('err', err);
    
  }

  const containers = await docker.listContainers({ all: true });

  // Find the container with the specified name
  const containerInfo = containers.find((c) => {
    console.log('c.Names', c.Names);
    
    return c.Names.includes(`/${name}`)
  });

  console.log('containerInfo.Ports', containerInfo.Ports);
  

  const oldContainer = await docker.getContainer(containerInfo.Id)

  await oldContainer.stop()
  await oldContainer.remove()

  let portBindings = {}
  containerInfo.Ports.forEach(port => {
    const key = `${port.PrivatePort}/${port.Type}`;
    if (!portBindings[key]) {
        portBindings[key] = [];
    }
    if (port.IP != '::') {
      portBindings[key].push({ HostPort: port.PublicPort.toString() });
    }
  })

  console.log('portBindings', portBindings);
  

  let createOptions = {
    Image: newImageTag,
    name,
    HostConfig: {
      PortBindings: portBindings
    }
  }
    
  const newContainer = await docker.createContainer(createOptions);
  await newContainer.start();
    

    // Inspect the container to get its current configuration
  // const containerInfo = await container.inspect();

  // Update the image in the container configuration

  // Commit the changes to create a new image

  // Stop and remove the old container
  
  // You can add your logic here to update the tag in your application

  res.json({ message: 'Tag updated successfully' });
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
