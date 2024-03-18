const { Sequelize } = require('sequelize');
const Connection = require('./Connection');
const fs = require('fs').promises;
// Assuming Connection correctly sets up and exports a Sequelize instance

class UserDocument extends Connection {
  constructor() {
    super(); // Initializes the connection via the Connection class

    this.model = this.defineModel();

    // Synchronize the model with the database
    this.model.sync({ alter: true })
      .then(() => {
        console.log("The table for the UserDocument model was just (re)created!");
      })
      .catch(error => console.error('Error syncing database:', error));
  }
  getModel() {
    return this.model;
  }
 

  defineModel() {
    return this.sequelize.define('UserDocument', {
      documentId: {
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
      docType: {
        type: Sequelize.ENUM('identification',  'cat 3', 'cat 2', 'cat 1'),
        allowNull: false,
      },
      image: {
        type: Sequelize.BLOB,
        allowNull: true,
      },
      fileType: {
        type: Sequelize.STRING, // Storing the MIME type as a string
        allowNull: true, // Adjust based on whether you require this field
      },
      fileName: {
        type: Sequelize.STRING, // Storing the MIME type as a string
        allowNull: true, // Adjust based on whether you require this field
      },
    }, {
      tableName: 'user_documents',
      timestamps: true,
    });
  }

  async addUserDocument(req, res) {
    try {
      const  docType = req.body.docType;
      if (!['identification', 'cat 3', 'cat 2', 'cat 1'].includes(docType)) {
        throw new Error('Invalid document type');
      }
      const imageData = fs.readFile(req.file.path);
       
      const document = await this.model.create({
        userId: req.session.userId,
        docType: docType,
        image: imageData,
        fileType: req.file.mimetype, // Add this line to store the file type
        fileName: req.file.originalname, // Add this line to store the file name
      });
  
      console.log('Document added successfully:', document);

      return document;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }
  async getUserDocuments(userId) {
    try {
      const documents = await this.model.findAll({
        where: { userId },
        attributes: { exclude: ['image'] }, // Exclude the image blob from the results
      });

      if (!documents.length) {
        console.log('No documents found for user ID:', userId);
        return [];
      }

      console.log('Documents found:', documents);
      return documents;
    } catch (error) {
      console.error('Error retrieving documents:', error);
      throw error; // Rethrow or handle as needed
    }
  }
  async getUserDocumentImage(documentId) {
    try {
      const document = await this.model.findByPk(documentId);

      if (!document) {
        console.log('No document found for ID:', documentId);
        return null;
      }

      console.log('Document found:', document);
      return document.image;
    } catch (error) {
      console.error('Error retrieving document image:', error);
      throw error; // Rethrow or handle as needed
    }
  }

}

module.exports = UserDocument;
