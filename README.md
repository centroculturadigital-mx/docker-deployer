# Docker Controller API

## The problem it solves

When developing a (CI/CD)[https://www.redhat.com/en/topics/devops/what-is-ci-cd] (Continous Integration and Continous Delivery/Deployent) strategy. This is normally normally done using a pipeline for building docker images either with github or gitlab triggered by a commit on a specific branch (the CI stage) and then passing a SSH key to a second pipeline which will then access the server via ssh and run some commands (normally pulling and deploying the new image). This last strategy comes with some **problems**:

- Give access to developers to run commands on the server by changing the CD job on the pipeline
- Or have a complicated cronjob fetching the new build and guessing or accesing an API where the new tag is saved

## How we solve this problem

Using (dockerode)[https://github.com/apocas/dockerode] and (dockerode-compose)[https://github.com/apocas/dockerode-compose] and expressJS, we created an API that could take a project/container name and a new tag and update its docker-compose yml manifest on the server and pull and deploy the new software version

## Feautres

- [x] Web app to visualize info 
- [x] Web API to fetch and update info 
- [x] Show running containers 
- [x] Show all containers
- [x] Show compose groups and it's services
- [x] Change the tag for a service image on a docker compose manifest
- [ ] Lista de palabras clave en nombre de cotenedores para ignorar en UI y api
- [ ] Save image history per service  (reg, tag, pulldate, commit desc, commit autho)
- [ ] Show image history per service on weh web app
- [ ] Authentication
- [ ] Select a previous image to rollback a service
- [ ] Show the log a specific service on the web app
- [ ] Create a new compose group on the web app

## Usage




