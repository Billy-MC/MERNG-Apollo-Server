const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { PubSub } = require('graphql-subscriptions');
const express = require('express');
const http = require('http');

require('dotenv').config();

const connectToMongoDB = require('./database/mongodb');
const logger = require('./config/logger');

const pubSub = new PubSub();

async function startApolloServer(schema) {
	const app = express();
	const httpServer = http.createServer(app);

	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		cors: true,
		introspection: true,
		tracing: true,
		context: ({ req }) => ({ req, pubSub }),
	});

	connectToMongoDB();

	await server.start();
	server.applyMiddleware({
		app,
		path: '/',
		cors: true,
	});

	await httpServer.listen({ port: 4000 });
	logger.info(
		`🚀 Apollo Server ready at http://localhost:4000${server.graphqlPath}`
	);
}

module.exports = startApolloServer;
