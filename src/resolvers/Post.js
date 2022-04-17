const { AuthenticationError } = require('apollo-server-express');
const Post = require('../models/Post');

const { checkAuth } = require('../utils/check-auth');

const PostResolvers = {
	Query: {
		getPosts: async () => {
			try {
				const posts = await Post.find().sort({ createdAt: -1 });
				return posts;
			} catch (err) {
				throw new Error(err);
			}
		},
		getPost: async (_, args) => {
			const { postId } = args;
			try {
				const post = await Post.findById(postId);
				if (!post) {
					throw new Error('Post not found!');
				}
				return post;
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Mutation: {
		createPost: async (_, args, context) => {
			console.log(context.pubSub);
			const { body } = args;
			const user = checkAuth(context);

			const post = new Post({
				body,
				user: user.id,
				username: user.username,
				createdAt: new Date().toISOString(),
			});

			const savedPost = await post.save();
			return savedPost;
		},
		deletePost: async (_, args, context) => {
			const { postId } = args;
			const user = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				if (user.username !== post.username) {
					throw new AuthenticationError('Action not allowed');
				}
				await post.delete();
				return 'Post deleted successfully';
			} catch (err) {
				throw new Error(err);
			}
		},
	},
};
module.exports = { PostResolvers };
