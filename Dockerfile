# Use an official Node.js runtime as a parent image
FROM node:latest

# Update npm to the latest version
RUN npm install -g npm@latest


# Install necessary packages for running GUI applications, including Cypress dependencies
RUN apt-get update && apt-get install -y \
    mariadb-server  \
    xvfb \
    libgtk-3-0 \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    xauth \
    x11-apps \
    libatk-bridge2.0-0 \
    libgbm1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure MySQL
# Note: For production environments, it's important to set root passwords and user accounts securely.
RUN service mariadb start && \
    mysql -e "CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';" && \
    mysql -e "CREATE DATABASE mydb;" && \
    mysql -e "GRANT ALL ON *.* TO 'user'@'localhost';" && \
    mysql -e "FLUSH PRIVILEGES;"


# Set environment variables for X11 display
ENV DISPLAY=:99

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies including Cypress
RUN npm install

# Install Cypress globally
RUN npm install cypress -g

RUN npm install -g concurrently

RUN npm install tailwindcss serve cypress -g
# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000


# Start Xvfb, run the app, and then run Cypress
#CMD Xvfb :99 -screen 0 1024x768x16 & npm run dev
# && cypress open
# Command to run your application
CMD ["npm", "run", "dev"]