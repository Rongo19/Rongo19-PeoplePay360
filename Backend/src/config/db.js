const mongoose = require('mongoose');


async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected sucessfully');
    } catch (error) {
        console.error('Error connecting to Database:', error);
    } 
}


module.exports = connectDB;