const Post = require('../models/Post');

const PostResolvers = {
	Query: {
		async getPosts() {
			try {
				const posts = await Post.find();
				console.log(posts);
				return posts;
			} catch (err) {
				throw new Error(err);
			}
		},
	},
};
module.exports = { PostResolvers };
