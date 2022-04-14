const { Hello } = require('./Hello');
const { PostResolvers } = require('./Post');
const { scalarDate } = require('./Date');

const resolvers = {
	Query: {
		...Hello.Query,
		...PostResolvers.Query,
	},
	Date: scalarDate,
};

module.exports = { resolvers };
