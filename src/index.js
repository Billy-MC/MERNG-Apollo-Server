const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');

const startApolloServer = require('./app');
const { resolvers } = require('./resolvers');

const schema = loadSchemaSync('./**/*.graphql', {
	loaders: [new GraphQLFileLoader()],
});

// Create the schema, which will be used separately by ApolloServer and the WebSocket server.
const schemaWithResolvers = addResolversToSchema({
	schema,
	resolvers,
});

startApolloServer(schemaWithResolvers);
