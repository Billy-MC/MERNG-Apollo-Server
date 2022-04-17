const { PubSub } = require('graphql-subscriptions');
const {
	AuthenticationError,
	UserInputError,
} = require('apollo-server-express');

const Post = require('../models/Post');
const User = require('../models/User');

const { checkAuth } = require('../utils/check-auth');

const pubsub = new PubSub();

const postsResolvers = {
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
			const { body } = args;
			const { id, username } = checkAuth(context);

			const post = new Post({
				body,
				user: id,
				username,
				createdAt: new Date().toISOString(),
			});

			await post.save();
			pubsub.publish('NEW_POST', { newPost: post });
			return post;
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
		likePost: async (_, args, context) => {
			const { postId } = args;
			const { username } = checkAuth(context);
			const post = await Post.findById(postId);

			if (!post) {
				throw new UserInputError('Post not found!');
			}

			const likedPeople = post.likes.find(like => like.username === username);

			if (!likedPeople) {
				// like the post
				post.likes.push({ username, createdAt: new Date().toISOString() });
			} else {
				// unlike the liked post!
				post.likes = post.likes.filter(like => like.username !== username);
			}

			await post.save();
			return post;
		},
	},
	Subscription: {
		newPost: {
			subscribe: () => pubsub.asyncIterator('NEW_POST'),
		},
	},
	Post: {
		likeCount: parent => parent.likes.length,
		commentCount: parent => parent.comments.length,
		user: async parent => {
			const user = await User.findById(parent.user);
			return user;
		},
	},
};
module.exports = { postsResolvers };
