const express = require('express');
const path = require('path');
const Init = require('./src/backEnd/Init');
const app = express();


app.use(express.static(path.join(__dirname, 'src/frontEnd')));

// Redirect or handle /backend requests
app.use('/ajax', (req, res) => {

    console.log('This is the backend response!');
    new Init(req, res);


});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
