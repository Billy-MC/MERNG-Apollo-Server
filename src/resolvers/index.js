const { Hello } = require('./hello');
const { PostResolvers } = require('./post');
const { UserResolvers } = require('./user');

const resolvers = {
	Query: {
		...Hello.Query,
		...PostResolvers.Query,
	},
	Mutation: {
		...UserResolvers.Mutation,
		...PostResolvers.Mutation,
	},
};

module.exports = { resolvers };
