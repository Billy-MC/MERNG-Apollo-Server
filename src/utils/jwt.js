const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

const generateToken = user => {
	const token = jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		secret,
		{
			expiresIn: '1d',
		}
	);
	return token;
};

const validateToken = token => {
	try {
		return jwt.verify(token, secret);
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = { generateToken, validateToken };
