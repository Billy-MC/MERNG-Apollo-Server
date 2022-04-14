const { Hello } = require('./hello');
const { PostResolvers } = require('./post');
const { scalarDate } = require('./scalar-date');

const resolvers = {
	Query: {
		...Hello.Query,
		...PostResolvers.Query,
	},
	Date: scalarDate,
};

module.exports = { resolvers };
