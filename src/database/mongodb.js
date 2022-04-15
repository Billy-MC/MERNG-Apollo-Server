const mongoose = require('mongoose');

const logger = require('../config/logger');

const connectToMongoDB = async () => {
	await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true }, () => {
		logger.info('🚀 MongoDB ready Connected!');
	});
};

module.exports = connectToMongoDB;
