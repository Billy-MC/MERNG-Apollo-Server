const {
	AuthenticationError,
	UserInputError,
} = require('apollo-server-express');

const { checkAuth } = require('../utils/check-auth');
const Post = require('../models/Post');

const commentsResolvers = {
	Mutation: {
		createComment: async (_, args, context) => {
			const { postId, body } = args;
			const { username } = checkAuth(context);
			if (body.trim() === '') {
				throw new UserInputError('Empty comment', {
					errors: {
						body: 'Comment body must not empty',
					},
				});
			}

			const post = await Post.findById(postId);
			if (!post) {
				throw new UserInputError('Post not found!');
			}
			post.comments.unshift({
				body,
				username,
				createdAt: new Date().toISOString(),
			});
			await post.save();
			return post;
		},
	},
};

module.exports = { commentsResolvers };
