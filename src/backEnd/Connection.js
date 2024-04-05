const dotenv = require('dotenv');
const path = require('path');

// Specify the path to the .env file
const envPath = path.resolve(__dirname, '..', 'password.env');

// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

const { Sequelize } = require('sequelize');

class Connection {
  constructor() {
    this.sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
      host: process.env.MYSQL_SEVER,
      port: '3306', // Change the port number to your desired port

      dialect: 'mariadb',
    });
    this.salt=parseInt(process.env.SALT);

  }
}

module.exports = Connection;
