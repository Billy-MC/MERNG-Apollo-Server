const { AuthenticationError } = require('apollo-server-express');

const { validateToken } = require('./jwt');

const checkAuth = context => {
	const authHeader = context.req.headers.authorization;

	if (!authHeader) {
		throw new Error('You are not logged in! Please Login to get access');
	}

	const tokenArray = authHeader.split(' ');
	const token = tokenArray[1];
	if (tokenArray[0] !== 'Bearer' || tokenArray.length !== 2) {
		throw new Error('Authorization header must be provided!');
	}
	if (!token) {
		throw new Error('Authentication token must be "Bearer [token]"');
	}

	try {
		return validateToken(token);
	} catch (err) {
		throw new AuthenticationError('Invalid/Expired token');
	}
};

module.exports = { checkAuth };
