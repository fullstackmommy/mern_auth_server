const express = require('express');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express()

// connect to db
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(()=> console.log('DB connected'))
.catch(err => console.log('DB CONNECTION ERROR: ', err))

// app middleware
app.use(morgan('dev'));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
    app.use(cors({origin: 'http://localhost:3002'}))
}

// middleware
app.use('/api', authRoutes)

const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(`API is running on port ${port} - ${process.env.NODE_ENV}`)
})