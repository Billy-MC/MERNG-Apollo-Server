const { model, Schema } = require('mongoose');
const postSchema = new Schema({
	body: String,
	username: String,
	createdAt: Date,
	comments: [
		{
			body: String,
			username: String,
			createdAt: Date,
		},
	],
	like: [
		{
			username: String,
			createdAt: Date,
		},
	],
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users',
	},
});

module.exports = model('Post', postSchema);
