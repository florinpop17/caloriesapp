// initializations
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

// mongoose and connection to mongodb
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const db = mongoose.connect('mongodb://localhost/caloriesapp');

// Other variables
const PORT = process.env.PORT || 80;
const config = require('./config');

// Set key from config
app.set('secretKey', config.secret);

// Database Models
const Meal = require('./models/mealModel.js');
const User = require('./models/userModel.js');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(morgan('combined'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
})

// Routes
const mealRouter = require('./routes/mealRouter')(Meal);
const userRouter = require('./routes/userRouter')(User);
const tokenRouter = require('./routes/tokenRouter')(User, app);

app.use('/api/meals', mealRouter);
app.use('/api/users', userRouter);
app.use('/api', tokenRouter);

// Serving root index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Running the server
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });
