const { Sequelize } = require('sequelize');
const Connection = require('./Connection');
const bcrypt = require('bcrypt');



class UserModel extends Connection {
  constructor() {
    
    super(); // Call the parent class's constructor

    this.salt=10;
    this.model = this.defineModel();
    this.model.sync(); // Ensures the table matches the model. It creates the table if it does not exist (and does nothing if it already exists)
  }

  defineModel() {
    return this.sequelize.define('User', {
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        call_sign: {
          type: Sequelize.STRING(50),
          // allowNull is true by default for all columns except primary key
        },
        Full_name: {
          type: Sequelize.STRING,
          // allowNull is true by default
        },
        birthday: {
          type: Sequelize.DATE,
          // allowNull is true by default
        },
        is_certified: {
          type: Sequelize.BOOLEAN,
          defaultValue: 0,
        },
        verification_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: 0,
        },
        role: {
          type: Sequelize.ENUM('pupil', 'contributor', 'admin'),
          defaultValue: 'pupil',
        },
        certification_level: {
          type: Sequelize.ENUM('NOHAM', 'cat 3', 'cat 2', 'cat 1'),
          defaultValue: 'NOHAM',
        },
        created_at: {
          type: Sequelize.DATE, // Use Sequelize.DATE for date/time columns
          defaultValue: Sequelize.NOW, 
          // Make sure to use the correct SQL function for the default value in your DBMS
        },
      }, {
        timestamps: false, // Disable Sequelize's automatic timestamp columns if you're manually defining them
        tableName: 'users' // Specify the table name if it does not match the model name
      });
  }
   generateRandomCode(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  }

  async createUser(res,email, password) {
    try {
        const verificationCode = this.generateRandomCode(); // Generate a random code
        
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, this.salt);
        console.log('Email:', email);
        console.log('Hashed password:', hashedPassword);
        console.log('Verification code:', verificationCode);


        const user = await this.model.create({ email, password: hashedPassword, verification_code: verificationCode });
        
        
        this.findAllUsers();
        console.log('User successfully created.');
        res.status(200).json({ success: true, message: "User registration failed." });

        
        return true;
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(200).json({ success: false, message: "User registration failed." });

        return false;
    }
}

  async findUserByEmailAndPassword(res,email, password) {
    try {
      const user = await this.model.findOne({ where: { email } });
      if (user) {

        // Compare provided password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password); // Assuming 'password' field stores the hashed password

        
        console.log('Is match:', isMatch);

        if (isMatch) {
          console.log('User authenticated successfully.');
           
          res.status(200).json( { success: true, message: "Error deleting user.", user: user.toJSON()});
          return false;
        } else {
          console.log('Authentication failed. Password does not match.');
          res.status(200).json( { success: false, message: "Error deleting user." });
          return false;
        }
      } else {
        console.log('User not found');
        res.status(200).json( { success: false, message: "Error deleting user." });
        return false;
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(200).json( { success: false, message: "Error deleting user." });
      return false;

    }
  }
  async deleteUser(res, email, password) {
    try {
        const user = await this.findUserByEmail(email);
        if (!user) {
            console.log('User not found.');
            res.status(200).json( { success: false, message: "User not found." });
            return false;
        }
        

        // Compare provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.password); // Assuming 'password' field stores the hashed password
        if (!match) {
            console.log('Password does not match.');
            res.status(200).json( { success: false, message: "Password does not match." });
            return	false;
        }

        // Assuming 'id' is the identifier used in your database
        await this.model.destroy({
          where: { id: user.id }
      });
        console.log('User successfully deleted.');
        res.status(200).json( { success: true, message: "User successfully deleted." }) ;
        return true;

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(200).json( { success: false, message: "Error deleting user." });
        return false;
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
  async findAllUsers() {
    try {
      const users = await this.model.findAll();
      if (users.length > 0) {
        console.log('All users:', users.map(user => user.toJSON()));
      } else {
        console.log('No users found');
      }
      return users;
    } catch (error) {
      console.error('Error retrieving users:', error);
      throw error;
    }
  }
}
module.exports = UserModel;
