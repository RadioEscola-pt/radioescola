#!/bin/bash

# Start the Node.js application

pip install -r requirements.txt
cd src
npm install
npm run dev
npx cypress open



git clone https://github.com/RadioEscola-pt/radioescola.git
cd radioescola

git swwitch editor
python3 docker.py build

sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
sudo iptables -t nat -A POSTROUTING -j MASQUERADE
sudo netfilter-persistent save
sudo netfilter-persistent reload