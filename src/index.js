const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const logger = require('./config/logger');
const { resolvers } = require('./resolvers');

const combinedSchema = loadSchemaSync('./**/*.graphql', {
	loaders: [new GraphQLFileLoader()],
});

const schemaWithResolvers = addResolversToSchema({
	schema: combinedSchema,
	resolvers,
});

async function startApolloServer(schema) {
	const app = express();
	const httpServer = http.createServer(app);

	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	await mongoose.connect(process.env.MONGODB, { useNewUrlParser: true }, () => {
		logger.info('🚀 MongoDB ready Connected!');
	});

	await server.start();
	server.applyMiddleware({
		app,
		path: '/',
	});

	await httpServer.listen({ port: 4000 });
	logger.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(schemaWithResolvers);
