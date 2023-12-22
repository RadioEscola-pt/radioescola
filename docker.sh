#!/bin/bash

if [ "$1" == "build" ]; then
    # Comando para construir a imagem Docker
    sudo docker build -t radioescola .
elif [ "$1" == "release" ]; then
    docker cp . radioescola_container:/usr/src/app
    docker exec -it radioescola_container bash -c "npm install"
    docker exec -it radioescola_container bash -c "npm run dev"
elif [ "$1" == "lauch" ]; then
    docker run -it --rm --name radioescola_container  -e DISPLAY=$DISPLAY \
        -v /tmp/.X11-unix:/tmp/.X11-unix \
        -p 3000:3000 \
        radioescola
else
    echo "Opção inválida. Use 'docker.sh build' para construir a imagem, 'docker.sh release' para lançar o contêiner, ou 'docker.sh launch' para iniciar a aplicação."
fi
