docker run -it --rm --name radioescola_container  -e DISPLAY=$DISPLAY \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -p 3000:3000 \
    radioescola
    