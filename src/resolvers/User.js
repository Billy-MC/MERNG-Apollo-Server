const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server-express');

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const {
	validateRegisterInput,
	validateLoginInput,
} = require('../utils/validators');
const logger = require('../config/logger');

const UserResolvers = {
	Mutation: {
		register: async (_, args) => {
			try {
				const {
					registerInput: { username, email, password, confirmPassword },
				} = args;

				// Validate user data
				const { errors, valid } = validateRegisterInput(
					username,
					email,
					password,
					confirmPassword
				);
				if (!valid) throw new UserInputError('Error', { errors });

				// Make sure user doesn't exist
				const existingEmail = await User.findOne({ email });
				const existingUsername = await User.findOne({ username });
				if (existingEmail) {
					throw new UserInputError('user is existed', {
						errors: {
							email: 'This email is existed',
						},
					});
				}
				if (existingUsername) {
					throw new UserInputError('user is existed', {
						errors: {
							username: 'This username is existed',
						},
					});
				}

				// hash password and create an auth token
				const salt = await bcrypt.genSalt(12);
				const hashedPassword = await bcrypt.hash(password, salt);

				const user = new User({
					email,
					username,
					password: hashedPassword,
					createdAt: new Date().toISOString(),
				});

				const res = await user.save();
				const createdUser = res.toJSON();
				const token = generateToken(user);

				return {
					...createdUser,
					id: res.id,
					token,
				};
			} catch (err) {
				logger.error(JSON.stringify(err.extensions.errors));
				return err;
			}
		},
		login: async (_, args) => {
			const {
				loginInput: { username, email, password },
			} = args;
			const { errors, valid } = validateLoginInput(username, email, password);
			if (!valid) throw new UserInputError('Error', { errors });

			const userPayload = email ? { email } : { username };

			try {
				const user = await User.findOne(userPayload).select('+password');
				if (!user) {
					errors.general = 'User not found';
					throw new UserInputError('User not found', { errors });
				}

				const correctPassword = await bcrypt.compare(password, user.password);
				if (!correctPassword) {
					errors.general = 'Wrong credential';
					throw new UserInputError('Wrong credential', { errors });
				}

				const token = generateToken(user);

				const loggedInUser = user.toJSON();
				return {
					...loggedInUser,
					id: user.id,
					token,
				};
			} catch (err) {
				logger.error(JSON.stringify(err.extensions.errors));
				return err;
			}
		},
	},
};

module.exports = { UserResolvers };
