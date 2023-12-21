docker cp . radioescola_container:/usr/src/app
docker exec -it radioescola_container bash -c "npm install"
docker exec -it radioescola_container bash -c "npm run dev"


