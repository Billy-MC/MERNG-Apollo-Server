const { model, Schema } = require('mongoose');

const userSchema = new Schema({
	username: String,
	password: { type: String, select: false },
	email: String,
	createdAt: Date,
});

module.exports = model('User', userSchema);
