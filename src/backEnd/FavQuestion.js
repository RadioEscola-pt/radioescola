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
        unique: true, // Ensures userId is unique
        references: {
          model: 'users', // Assumes you have a User table
          key: 'id', // The column in the User table that userId references
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
        const fav =   await this.model.findOne({ where: { userId: req.body.userId } });

        if (fav) {
            // Return the found favorite record
            return fav;
        } else {
            // Or handle as you see fit if no record is found
            return null;
        }
    } catch (error) {
        console.log('Error fetching favorite by userId:', error);
        throw error; // Re-throw or handle as needed
    }
}
  async storeFav(req, res) {
    const existingFav = await this.model.findOne({ where: { userId: req.body.userId } });

    const sentTime = req.body.time ? new Date(req.body.time) : null;

    if (!existingFav || !sentTime || existingFav.changeTime < sentTime) {

      try {
        const fav = await this.model.create({
          userId: req.body.userId,
          currentTime: new Date(), // This is redundant if using timestamps
          question1Fav: JSON.stringify(req.body.question1Fav),
          question2Fav: JSON.stringify(req.body.question2Fav),
          question3Fav: JSON.stringify(req.body.question3Fav)
        });

        res.json({ success: true, message: 'Favorites saved successfully', data: fav });
      } catch (error) {
        console.log('Error storing favorite:', error);
        res.status(500).json({ success: false, message: 'Error storing favorite', error: error.message });
      }
    }
  }
}

module.exports = FavQuestion; // This should export FavQuestion, not UserDocument
