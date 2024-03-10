const { DataTypes } = require('sequelize');
const Connection = require('./Connection');

class UserModel extends Connection {
  constructor() {
    
    super(); // Call the parent class's constructor
    this.salt=10;
    this.model = this.defineModel();
    this.model.sync(); // Ensures the table matches the model. It creates the table if it does not exist (and does nothing if it already exists)
  }

  defineModel() {
    this.sequelize.define('User', {
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        call_sign: {
          type: DataTypes.STRING(50),
          // allowNull is true by default for all columns except primary key
        },
        Full_name: {
          type: DataTypes.STRING,
          // allowNull is true by default
        },
        birthday: {
          type: DataTypes.DATE,
          // allowNull is true by default
        },
        is_certified: {
          type: DataTypes.BOOLEAN,
          defaultValue: 0,
        },
        verification_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: 0,
        },
        role: {
          type: DataTypes.ENUM('pupil', 'contributor', 'admin'),
          defaultValue: 'pupil',
        },
        certification_level: {
          type: DataTypes.ENUM('NOHAM', 'cat 3', 'cat 2', 'cat 1'),
          defaultValue: 'NOHAM',
        },
        created_at: {
          type: DataTypes.TIMESTAMP,
          defaultValue: DataTypes.NOW,
          // Make sure to use the correct SQL function for the default value in your DBMS
        },
      }, {
        timestamps: false, // Disable Sequelize's automatic timestamp columns if you're manually defining them
        tableName: 'users' // Specify the table name if it does not match the model name
      });
  }
  async createUser(email, password) {
    try {
      // Hash the password before storing it in the database
     
      const hashedPassword = await bcrypt.hash(password, this.salt);

      const user = await this.model.create({ email, password: hashedPassword });
      console.log('User successfully created.');
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }

  async findUserByEmailAndPassword(email, password) {
    try {
      const user = await this.model.findOne({ where: { email } });
      if (user) {
        // Compare provided password with hashed password in the database
        const hashedPassword = await bcrypt.hash(user.password, this.salt);
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (isMatch) {
          console.log('User authenticated successfully.');
          return user.toJSON();
        } else {
          console.log('Authentication failed. Password does not match.');
          return null;
        }
      } else {
        console.log('User not found');
        return null;
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }


  async findUserByEmail(email) {
    try {
      const user = await this.model.findOne({ where: { email } });
      if (user) {
        console.log('User found:', user.toJSON());
        return user.toJSON();
      } else {
        console.log('User not found');
        return null;
      }
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }
}
module.exports = UserModel;
