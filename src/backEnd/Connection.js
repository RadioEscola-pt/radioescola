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
      host: 'localhost',
      dialect: 'mariadb',
    });

  }
}

module.exports = Connection;
