const { helloResolvers } = require('./hello');
const { postsResolvers } = require('./posts');
const { usersResolvers } = require('./users');
const { commentsResolvers } = require('./comments');

const resolvers = {
	Query: {
		...helloResolvers.Query,
		...postsResolvers.Query,
	},
	Mutation: {
		...usersResolvers.Mutation,
		...postsResolvers.Mutation,
		...commentsResolvers.Mutation,
	},
};

module.exports = { resolvers };
