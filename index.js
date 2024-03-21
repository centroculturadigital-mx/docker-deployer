const express = require("express");
const fs = require("fs");

const handlebars = require("express-handlebars"); //Sets our app to use the handlebars engine
const bodyParser = require('body-parser');

const Docker = require("dockerode");
const socket = process.env.DOCKER_SOCKET || "/var/run/docker.sock";

const stats = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error("Are you sure the docker is running?");
}

app.engine('hbs', handlebars());
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));

const app = express();
const hostname = "127.0.0.1";
const port = 3000;

const docker = new Docker({ socketPath: socket });

app.get("/", (req, res) => {
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  docker.listContainers({ all: true }, function (err, containers) {
    console.log('containers', containers);
    res.render("main", { 
      layout: "index", 
      containers
    });
  });
});

app.post("/update-image/:container", (req, res) => {
  const container = new DockerodeCompose(
    docker,
    "./docker-compose.wordpress.yml",
    "wordpress"
  );
  const doc = yaml.load(
    fs.readFileSync("./docker-compose.wordpress.yml", "utf8")
  );
  let image = doc.services.db.image.split(":");
  doc.services.db.image = image[0] + ":" + "4";
  let yamlStr = yaml.dump(doc);
  fs.writeFileSync("docker-compose.wordpress.yml", yamlStr, "utf8");

  // let x = await compose.pull(null);
  console.log("compose", JSON.stringify(compose));
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
