const { Hello } = require('./Hello');
const { PostResolver } = require('./Post');
const { scalarDate } = require('./Date');

const resolvers = {
	Query: {
		...Hello.Query,
		...PostResolver.Query,
	},
	Date: scalarDate,
};

module.exports = { resolvers };
