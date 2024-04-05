#!/bin/bash

# Start the Node.js application

pip install -r requirements.txt
cd src
npm install
npm run dev
npx cypress open



