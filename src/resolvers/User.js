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
		register: async (_, args, ctx, info) => {
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
				const token = generateToken(user);
				return {
					id: res.id,
					username: res.username,
					email: res.email,
					createdAt: res.createdAt,
					token,
				};
			} catch (err) {
				logger.error(JSON.stringify(err.extensions.errors));
				return err;
			}
		},
		login: async (_, args) => {
			const {
				loginInput: { username, password },
			} = args;
			const { errors, valid } = validateLoginInput(username, password);
			if (!valid) throw new Error('Error', { errors });

			try {
				const user = await User.findOne({ username }).select('+password');
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
				return {
					id: user.id,
					username: user.username,
					email: user.email,
					createdAt: user.createdAt,
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
