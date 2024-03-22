const express = require('express');
const session = require('express-session');
const UserDocument = require('./backEnd/UserDocument');
const multer = require('multer');


const path = require('path');
const Init = require('./backEnd/Init');
const bodyParser = require('body-parser'); // Import body-parser middleware

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'frontEnd')));



app.use(session({
    secret: 'your_secret_key', // Replace with a real secret in production
    resave: false,
    saveUninitialized: false,

    cookie: {
        secure: 'auto',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours

    }
}));

const upload = multer({ dest: '/uploadDocument' });

app.use('/uploadDocument', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(200).send('No file uploaded.');
    }
    if  (req.session.loggedIn === true) {

        try {
            // Instantiate your model (or use it directly if it's a static method)
            const userDocument = new UserDocument();
            userDocument.addUserDocument(req, res);
            
        } catch (error) {
            console.error('Error uploading document:', error);
            res.status(500).send('Error uploading document');
        }
    }
});
app.get('/image', async (req, res) => {
    try {
        const { id } = req.query;
        const userDocument = new UserDocument();
        const documentData = await userDocument.getDocumentData(id);

        if (!documentData) {
            return res.status(200).send({ success: false, message:'Document not found.'});
        }

        // Set the Content-Type to the document's MIME type
        res.setHeader('Content-Type', documentData.fileType);
        res.send(documentData.image); // Send the binary data
    } catch (error) {
        console.error('Error serving document:', error);
        res.status(200).send({ success: false, message:'Internal Server Error'});
    }
});
app.use('/TestUpload', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(200).send('No file uploaded.');
    }
    if  (req.session.loggedIn === true) {

        try {
            // Instantiate your model (or use it directly if it's a static method)
            const userDocument = new UserDocument();
            userDocument.addTestDocument(req, res);
        } catch (error) {
            console.error('Error uploading document:', error);
            res.status(200).send({ success: false, message:'Error uploading document'});
        }
    }
});

// Redirect or handle /backend requests
app.use('/ajax', (req, res) => {

    console.log({ success: true, message: "User registered successfully." });
    //res.status(200).json({ success: true, message: "User registered successfully." });
    new Init(req, res);
    return true;


});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
