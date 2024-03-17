#!/bin/bash
echo "Radio Escola Docker Script"
# Load environment variables from .env file in the ../src/backend directory
ENV_FILE="../src/pass.env"
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE..."
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
else
    echo "Error: Environment file not found at $ENV_FILE"
fi

if [ "$1" == "build" ]; then
    echo "Building Docker image..."
    docker build -t radioescola -f docker/Dockerfile-nodejs .
    docker build -t radioescola-db -f docker/Dockerfile-mariadb .
elif [ "$1" == "refresh" ]; then
    echo "Refreshing container..."
    docker cp . radioescola_container:/usr/src/app
    docker exec -it radioescola_container bash -c "npm install"
    docker exec -it radioescola_container bash -c "npm run dev"
elif [ "$1" == "launch" ]; then
    echo "Launching containers..."
    docker run -d --name radioescolaDb_container \
        -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
        -e MYSQL_DATABASE=$MYSQL_DATABASE \
        -e MYSQL_USER=$MYSQL_USER \
        -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
        mariadb:latest
    sleep 10
    docker run -it --rm --name radioescola_container -e DISPLAY=$DISPLAY \
        -v /tmp/.X11-unix:/tmp/.X11-unix \
        -p 3000:3000 \
        --link mariadb_container:mariadb \
        radioescola
else
    echo "Invalid option. Use 'docker.sh build' to build the image, 'docker.sh refresh' to refresh the container, or 'docker.sh launch' to start the application."
fi
