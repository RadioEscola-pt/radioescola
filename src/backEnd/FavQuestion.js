const Sequelize = require('sequelize');
const Connection = require('./Connection');

class FavQuestion extends Connection {
  constructor() {
    super(); // Initializes the connection via the Connection class

    this.model = this.defineModel();

    // Synchronize the model with the database
    this.model.sync({ alter: true })
      .then(() => console.log("The table for the UserFavQuestion model was just (re)created!"))
      .catch(error => console.error('Error syncing database:', error));
  }

  defineModel() {
    return this.sequelize.define('UserFavQuestion', {
      questionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // The name of the User table
          key: 'userId', // Key in User table that we're referencing
        },
      },
      question1Fav: {
        type: Sequelize.STRING,
        allowNull: true
      },
      question2Fav: {
        type: Sequelize.STRING,
        allowNull: true
      },
      question3Fav: {
        type: Sequelize.STRING,
        allowNull: true
      },
      changeTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      currentTime: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
    }, {
      tableName: 'user_fav',
      timestamps: true, // Adds createdAt and updatedAt
    });
  }
  getModel() {
    return this.model;
  }
  async getCurrentFavByUser() {
    try {
      const fav = await this.model.findOne({
        where: { userId: req.session.userId },
      });

      if (fav) {
        return fav; // Return the found favorite record
      } else {
        return null; // Or handle as you see fit if no record is found
      }
    } catch (error) {
      console.log('Error fetching favorite by userId:', error);
      throw error; // Re-throw or handle as needed
    }
  }
  async getFav(req, res) {
    try {
      // Attempt to find a favorite record by the provided userId
      const fav = await this.model.findOne({ where: { userId: req.session.userId } });

      if (fav) {
        // Return the found favorite record
        res.status(200).json({ success: true, message: "sem fav", data: fav });
      } else {
        // Or handle as you see fit if no record is found
        res.status(200).json({ success: true, message: "sem fav", data: null });
      }
    } catch (error) {
      console.log('Error fetching favorite by userId:', error);
      throw error; // Re-throw or handle as needed
    }
  }
  async storeFav(req, res) {
    const userId = req.session.userId; // Assuming userId is stored in session
    // Parse sentTime from the request, defaulting to null if not provided or invalid
    const sentTime = req.body.currentTime ? new Date(req.body.currentTime) : null;
  
    try {
      // Find the existing favorites entry for the user
      const existingFav = await this.model.findOne({ where: { userId: userId } });
  
      // Determine the time to use for changeTime - use sentTime if valid, otherwise use current time
      const changeTime = sentTime && !isNaN(sentTime.valueOf()) ? sentTime : new Date();
  
      if (!existingFav || !sentTime || existingFav.changeTime < changeTime) {
        // If an existing record was found, update it. Otherwise, create a new one
        if (existingFav) {
          // Update existing record
          await existingFav.update({
            question1Fav: JSON.stringify(req.body.question1Fav),
            question2Fav: JSON.stringify(req.body.question2Fav),
            question3Fav: JSON.stringify(req.body.question3Fav),
            changeTime: changeTime
          });
          res.json({ success: true, message: 'Favorites updated successfully', data: existingFav });
        } else {
          // Create new record
          const fav = await this.model.create({
            userId: userId,
            question1Fav: JSON.stringify(req.body.question1Fav),
            question2Fav: JSON.stringify(req.body.question2Fav),
            question3Fav: JSON.stringify(req.body.question3Fav),
            changeTime: changeTime
          });
          res.json({ success: true, message: 'Favorites saved successfully', data: fav });
        }
      } else {
        // Existing data is up-to-date, or the sent time is not newer
        res.json({ success: false, message: 'No update needed' });
      }
    } catch (error) {
      console.log('Error storing favorite:', error);
      res.status(200).json({ success: false, message: 'Error storing favorite', error: error.message });
    }
  }
  


}

module.exports = FavQuestion; // This should export FavQuestion, not UserDocument
