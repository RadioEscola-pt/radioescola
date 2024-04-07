const Sequelize = require('sequelize');

const Connection = require('./Connection');
const session = require('express-session');
const UserDocument = require('./UserDocument');
const FavQuestion = require('./FavQuestion');
const EmailSender = require('./EmailSender');

const bcrypt = require('bcrypt');



class UserModel extends Connection {
  constructor() {

    super(); // Call the parent class's constructor

    this.model = this.defineModel();
    //this.model.sync(); // Ensures the table matches the model. It creates the table if it does not exist (and does nothing if it already exists)
    this.model.sync({ alter: true }).then(() => {
      console.log("The table for the User model was just (re)created!");
    }).catch(error => console.error('Error syncing database:', error));
    const userDoc = new UserDocument();
    const userFav = new FavQuestion();
    this.docModel = userDoc.getModel();
    this.favModel = userFav.getModel();


    this.model.hasMany(this.docModel, { foreignKey: 'userId' });
    this.docModel.belongsTo(this.model, { foreignKey: 'userId' });

    this.model.hasOne(this.favModel, { foreignKey: 'userId' });
    this.favModel.belongsTo(this.model, { foreignKey: 'userId' });


  }

  defineModel() {
    return this.sequelize.define('User', {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true // Automatically increment the value
      },
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



  
  async changeUserPassword(req, res, currentPass, newPassword) {
    if (!req.session.userId || !currentPass || !newPassword) {
      // Bad Request for missing input
      res.status(200).json({ success: false, message: "Missing information" });
      return false;
    }

    try {
      // Find the user by the ID stored in the session
      const user = await this.model.findByPk(req.session.userId);

      if (!user) {
        // Not Found for non-existing user
        res.status(200).json({ success: false, message: "User not found" });
        return false;
      }

      // Verify the current password
      const isMatch = await bcrypt.compare(currentPass, user.password);
      if (!isMatch) {
        // Unauthorized for incorrect current password
        res.status(200).json({ success: false, message: "Current password is incorrect" });
        return false;
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, this.salt);

      // Update the user's password
      await user.update({ password: hashedPassword });

      console.log('Password successfully updated.');
      // OK for successful password update
      res.status(200).json({ success: true, message: "Password successfully updated" });
      return true;

    } catch (error) {
      console.error('Error updating password:', error);
      // Internal Server Error for any server-side issues
      res.status(200).json({ success: false, message: "Error updating password" });
    }
  }
  async activateAccount(req, res, useID, key) {


    try {
      // Find the user by the ID stored in the session
      const user = await this.model.findByPk(useID);



      if (!user) {
        // Not Found for non-existing user
        res.status(200).json({ success: false, message: "User not found" });
        return false;
      }
     
      if (key!= user.verification_code) {
        // Unauthorized for incorrect current password
        res.status(200).json({ success: false, message: "Current password is incorrect" });
        return false;
      }


      // Update the user's password
      await user.update({ verification_code: 0, verified: true });

      console.log('Password successfully updated.');
      // OK for successful password update
      res.status(200).json({ success: true, message: "Password successfully updated" });
      return true;

    } catch (error) {
      console.error('Error updating password:', error);
      // Internal Server Error for any server-side issues
      res.status(200).json({ success: false, message: "Error updating password" });
    }
  }
  async changeUserLostPassword(req, res, useID, key) {


    try {
      // Find the user by the ID stored in the session
      const user = await this.model.findByPk(useID);



      if (!user) {
        // Not Found for non-existing user
        res.status(200).json({ success: false, message: "User not found" });
        return false;
      }
     
      if (key!= user.verification_code) {
        // Unauthorized for incorrect current password
        res.status(200).json({ success: false, message: "Current password is incorrect" });
        return false;
      }

      const verificationCode = this.generateRandomCode(); // Generate a random code

      const email = new EmailSender();
      email.sendMail(user.email, 'Nova  password', `A sua nova +assword e  ${verificationCode}`);


      // Hash the new password
      const hashedPassword = await bcrypt.hash(verificationCode, this.salt);

      // Update the user's password
      await user.update({ verification_code: 0, password: hashedPassword });

      console.log('Password successfully updated.');
      // OK for successful password update
      res.status(200).json({ success: true, message: "Password successfully updated" });
      return true;

    } catch (error) {
      console.error('Error updating password:', error);
      // Internal Server Error for any server-side issues
      res.status(200).json({ success: false, message: "Error updating password" });
    }
  }

  async createUser(res, email, password) {
    try {
      const verificationCode = this.generateRandomCode(); // Generate a random code

      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, this.salt);


      const user = await this.model.create({ email:email, password: hashedPassword, verification_code: verificationCode });


      const emailSender = new EmailSender();
      emailSender.sendMail(email, 'Conta Criand<', `O seu código de activacao é: ${verificationCode}`, `O seu código de recuperação é: <strong>http://${this.server}/activate?userId=${user.userId}&key=${verificationCode}</strong>`);

      console.log('User successfully created.');
      res.status(200).json({ success: true, message: "Conta Criada verifique o seu email" });
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(200).json({ success: false, message: "User registration failed." });

      return false;
    }
  }

  async findUserByEmailAndPassword(req, res, email, password) {
    const response = { success: false, message: "Utilizador nao encontrado ou password errada" };

    try {
      const user = await this.model.findOne({ where: { email } });
      if (user) {

        // Compare provided password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password); // Assuming 'password' field stores the hashed password

        console.log('Is match:', isMatch);

        if (isMatch) {
          console.log('User authenticated successfully.');
          // Create a user object for response
          const userResponse = user.toJSON();
          delete userResponse.password; // Remove password from the response object
          delete userResponse.verification_code; // Remove verification_code from the response object
          console.log('User:', userResponse);
          req.session.userId = userResponse.userId; // Store user ID in session
          req.session.email = userResponse.email; // Store user email in session
          req.session.role = userResponse.role; // Store user role in session
          req.session.certification_level = userResponse.certification_level; // Store user certification level in session
          req.session.is_certified = userResponse.is_certified; // Store user certification status in session
          req.session.verified = userResponse.verified; // Store user verification status in session
          req.session.role = userResponse.role; // Store the entire user object in s
          req.session.certification_level = userResponse.certification_level; // Store the entire user object in 
          req.session.birthday = userResponse.birthday; // Store the entire user object in
          req.session.call_sign = userResponse.call_sign; // Store the entire user object in
          req.session.loggedIn = true; // Store the entire user object in
          req.session.save(); // Save the session
          let userSessionData = {
            userId: req.session.userId,
            email: req.session.email,
            role: req.session.role,
            certification_level: req.session.certification_level,
            is_certified: req.session.is_certified,
            verified: req.session.verified,
            role: req.session.role,
            certification_level: req.session.certification_level,
            birthday: req.session.birthday,
            call_sign: req.session.call_sign,


          };


          res.status(200).json({ success: true, message: "Utilizador registado com sucesso", user: userSessionData });


          return true;
        } else {
          console.log('Authentication failed. Password does not match.');
          res.status(200).json(response);
          return false;
        }
      } else {
        console.log('User not found');
        res.status(200).json(response);
        return false;
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(200).json(response);
      return false;

    }
  }
  async deleteUser(res, email, password) {
    const response = { success: false, message: "Utilizador nao encontrado ou password errada" };
    try {
      const user = await this.findUserByEmail(email);
      if (!user) {
        console.log('User not found.');
        res.status(200).json(response);
        return false;
      }


      // Compare provided password with the stored hashed password
      const match = await bcrypt.compare(password, user.password); // Assuming 'password' field stores the hashed password
      if (!match) {
        console.log('Password does not match.');
        res.status(200).json(response);
        return false;
      }

      // Assuming 'id' is the identifier used in your database
      await this.model.destroy({
        where: { id: user.id }
      });
      console.log('User successfully deleted.');
      res.status(200).json({ success: true, message: "User successfully deleted." });
      return true;

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(200).json(response);
      return false;
    }
  }
  async lostPass(req,res, email) {
    const response = { success: false, message: "Utilizador nao encontrado" };
    const verificationCode = this.generateRandomCode(); // Generate a random code
    const user = await this.model.findOne({ where: { email } });
    if (!user) {
      console.log('User not found.');
      res.status(200).json(response);
      return false;
    }

    await user.update({ verification_code: verificationCode });

    const emailSend = new EmailSender();
    emailSend.sendMail(email, 'Recuperação de password', `O seu código de recuperação é: ${verificationCode}`, `O seu código de recuperação é: <strong>http://${this.server}/changeLostPass?userId=${user.userId}&key=${verificationCode}</strong>`);




  }
  async getAllUsers(req, res) {
    console.log("get all users ");
    if (req.session.role === 'admin') {
      let users = await this.findAllUsers();
      res.status(200).json({ success: true, message: "Utilizadores", users });
    }
    else {
      res.status(200).json({ success: false, message: "Acesso negado" });
    }


  }


  async findUserByEmail(email) {
    try {
      const user = await this.model.findOne({

        include: [{
          model: UserDocument,
          attributes: ['documentId'], // Specify attributes you want to include from the UserDocument
        }],
        attributes: { exclude: ['password'] },


      });
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
      const users = await this.model.findAll({
        include: [{
          model: this.docModel,
          attributes: ['documentId', 'fileName'], // Specify attributes you want to include from the UserDocument
        }],
        attributes: { exclude: ['password', 'verification_code'] }
      });

      return users;
    } catch (error) {
      console.error('Error retrieving users:', error);
      throw error;
    }
  }
}
module.exports = UserModel;
