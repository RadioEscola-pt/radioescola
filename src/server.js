const express = require('express');
const path = require('path');
const Init = require('./backEnd/Init');
const bodyParser = require('body-parser'); // Import body-parser middleware

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'frontEnd')));

// Redirect or handle /backend requests
app.use('/ajax', (req, res) => {

    console.log({ success: true, message: "User registered successfully." });
    //res.status(200).json({ success: true, message: "User registered successfully." });
    new Init(req, res);
    return true;


});
app.get('/ajax', (req, res) => {
    res.status(200).json({ success: true, message: "AJAX GET request received." });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
