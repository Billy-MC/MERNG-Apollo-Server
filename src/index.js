const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');

const startApolloServer = require('./app');
const { resolvers } = require('./resolvers');

const schema = loadSchemaSync('./**/*.graphql', {
	loaders: [new GraphQLFileLoader()],
});

const schemaWithResolvers = addResolversToSchema({
	schema,
	resolvers,
});

startApolloServer(schemaWithResolvers);
