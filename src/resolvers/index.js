const { helloResolvers } = require('./hello');
const { postsResolvers } = require('./posts');
const { usersResolvers } = require('./users');
const { commentsResolvers } = require('./comments');

const resolvers = {
	Post: {
		...postsResolvers.Post,
	},
	Query: {
		...helloResolvers.Query,
		...postsResolvers.Query,
	},
	Mutation: {
		...usersResolvers.Mutation,
		...postsResolvers.Mutation,
		...commentsResolvers.Mutation,
	},
	Subscription: {
		...postsResolvers.Subscription,
		...commentsResolvers.Subscription,
	},
};

module.exports = { resolvers };
