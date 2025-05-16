// startup.js
const mongoose = require('mongoose');
const CONFIG = require('./utils/config');


const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

async function initializeDatabase( startServer ) {
    try {
        await mongoose.connect(CONFIG.mongoURI, mongooseOptions);
        
        await startServer()

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully.');
        });

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error; // Propagate error to be handled by startup function
    }
}


module.exports = initializeDatabase
