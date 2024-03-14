#!/bin/bash

# Start the Node.js application
cd src
npm install
npm run dev
npx cypress open
