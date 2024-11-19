// step 1 import express
const express = require('express');
const app = express();
const morgan = require('morgan');
const { readdirSync } = require('fs');
const cors = require('cors');


// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// Dynamically require all route files in the 'routes' folder
readdirSync('./routes')
    .map((filename) => app.use('/api', require('./routes/' + filename)));

// step 2 start server
app.listen(5000, () => {
    console.log('server started on port 5000 ✅🌎');
});
