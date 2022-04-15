const jwt = require('jsonwebtoken');

const generateToken = user => {
	const secret = process.env.JWT_SECRET;
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

module.exports = { generateToken };
