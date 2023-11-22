#sudo chmod 666 /var/run/docker.sock
sudo docker build -t radioescola .
sudo docker run -p 3000:3000 -d radioescola
