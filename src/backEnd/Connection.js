const { Sequelize } = require('sequelize');

class Connection {
  constructor() {

    this.sequelize = new Sequelize('mydb', 'user', 'password', {
      host: 'localhost',
      dialect: 'mariadb',
    });
  }
}
module.exports = Connection;